<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Ocop\Criteria\Application\Services\CriteriaVersionService;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaGroupModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriterionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\MandatoryConditionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\ScoringRuleModel;

class OcopSweetPalermoCriteriaSeeder extends Seeder
{
    public const VERSION_CODE = 'OCOP-QD148-2023-FRESH';

    public function run(): void
    {
        // 1. Check if criteria version already exists. If yes, cleanly remove it to allow re-seeding safely.
        $existing = CriteriaVersionModel::where('version_code', self::VERSION_CODE)->first();
        if ($existing) {
            // Delete child groups, criteria, indicators, rules, conditions
            $existing->mandatoryConditions()->delete();
            $existing->scoringRules()->delete();
            foreach ($existing->groups as $grp) {
                foreach ($grp->criteria as $crit) {
                    $crit->indicators()->delete();
                    $crit->delete();
                }
                $grp->delete();
            }
            $existing->delete();
        }

        // 2. Create Criteria Version in DRAFT status
        $versionId = (string) Str::uuid();
        $version = CriteriaVersionModel::create([
            'id' => $versionId,
            'version_code' => self::VERSION_CODE,
            'name' => 'Bộ tiêu chí OCOP QĐ 148/QĐ-TTg - Rau, củ, quả tươi (Ớt chuông Sweet Palermo)',
            'effective_from' => '2023-02-24',
            'effective_to' => null,
            'source_reference' => [
                'legal_basis' => 'Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ',
                'target_product' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
                'product_category' => 'Rau, củ, quả, hạt tươi',
                'total_max_score' => 100.0,
                'groups' => [
                    'GA' => 'Phần A: Sản phẩm và sức mạnh cộng đồng (40.0đ)',
                    'GB' => 'Phần B: Khả năng tiếp thị (25.0đ)',
                    'GC' => 'Phần C: Chất lượng sản phẩm (35.0đ)',
                ],
            ],
            'status' => 'DRAFT',
        ]);

        // 3. Definition of Groups, Criteria, and Indicators
        // Total GA = 10 + 5 + 10 + 15 = 40.0
        // Total GB = 8 + 7 + 10 = 25.0
        // Total GC = 10 + 10 + 5 + 10 = 35.0
        // Grand Total = 100.0
        $structure = [
            [
                'group' => [
                    'code' => 'GA',
                    'name' => 'Phần A: Sản phẩm và sức mạnh cộng đồng',
                    'description' => 'Đánh giá nguồn gốc nguyên liệu địa phương, sử dụng lao động, tổ chức liên kết chuỗi sản xuất và bảo vệ môi trường',
                    'display_order' => 1,
                ],
                'criteria' => [
                    [
                        'code' => 'TC-A.1',
                        'name' => 'Nguồn nguyên liệu địa phương',
                        'description' => 'Tỷ lệ sử dụng nguyên liệu sản xuất tại địa phương tỉnh Lâm Đồng',
                        'max_score' => 10.0,
                        'mandatory' => true,
                        'display_order' => 1,
                        'indicator' => [
                            'code' => 'TC-A.1.1',
                            'name' => 'Tỷ lệ sử dụng nguyên liệu địa phương trong tỉnh',
                            'description' => 'Đo lường tỷ lệ diện tích và sản lượng ớt chuông thu hoạch trực tiếp tại vùng trồng Đà Lạt / Lạc Dương',
                            'max_score' => 10.0,
                            'mandatory' => true,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'FARM_PLOT_OR_LAND_USE',
                                'description' => 'Bản đồ số vùng trồng, danh sách thửa đất canh tác tại Đà Lạt / Lâm Đồng, giấy chứng nhận quyền sử dụng đất hoặc hợp đồng thuê đất',
                            ],
                            'scoring_rules' => [
                                ['score' => 10.0, 'label' => '100% nguyên liệu sản xuất tại địa phương trong tỉnh'],
                                ['score' => 7.0, 'label' => 'Từ 70% đến dưới 100% nguyên liệu sản xuất tại địa phương'],
                                ['score' => 5.0, 'label' => 'Từ 50% đến dưới 70% nguyên liệu sản xuất tại địa phương'],
                                ['score' => 1.0, 'label' => 'Dưới 50% nguyên liệu sản xuất tại địa phương'],
                                ['score' => 0.0, 'label' => 'Không sử dụng nguyên liệu tại địa phương'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'TC-A.2',
                        'name' => 'Sử dụng lao động tại chỗ',
                        'description' => 'Tỷ lệ sử dụng lao động địa phương và thành viên HTX có hợp đồng lao động',
                        'max_score' => 5.0,
                        'mandatory' => false,
                        'display_order' => 2,
                        'indicator' => [
                            'code' => 'TC-A.2.1',
                            'name' => 'Tỷ lệ lao động địa phương có hợp đồng hoặc thành viên HTX',
                            'description' => 'Số lượng và tỷ lệ thành viên xã viên, người lao động thường trú tại địa phương tham gia chuỗi sản xuất',
                            'max_score' => 5.0,
                            'mandatory' => false,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'MEMBER_LIST_OR_LABOR_CONTRACT',
                                'description' => 'Danh sách 165 hộ thành viên HTX Tân Tiến, sổ theo dõi lao động và hợp đồng liên kết thành viên',
                            ],
                            'scoring_rules' => [
                                ['score' => 5.0, 'label' => 'Từ 80% trở lên lao động địa phương có hợp đồng / thành viên HTX'],
                                ['score' => 3.0, 'label' => 'Từ 50% đến dưới 80% lao động địa phương'],
                                ['score' => 1.0, 'label' => 'Dưới 50% lao động địa phương'],
                                ['score' => 0.0, 'label' => 'Không sử dụng lao động địa phương'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'TC-A.3',
                        'name' => 'Tổ chức sản xuất & liên kết chuỗi',
                        'description' => 'Năng lực liên kết sản xuất và tiêu thụ theo chuỗi giá trị bền vững',
                        'max_score' => 10.0,
                        'mandatory' => false,
                        'display_order' => 3,
                        'indicator' => [
                            'code' => 'TC-A.3.1',
                            'name' => 'Năng lực liên kết chuỗi giá trị tiêu thụ sản phẩm',
                            'description' => 'Tỷ lệ sản lượng ớt chuông được tiêu thụ thông qua hợp đồng bao tiêu ổn định với chuỗi siêu thị',
                            'max_score' => 10.0,
                            'mandatory' => false,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'SUPPLY_CONTRACT',
                                'description' => 'Hợp đồng cung ứng bao tiêu sản phẩm với chuỗi siêu thị WinMart, Co.opmart và hóa đơn xuất kho',
                            ],
                            'scoring_rules' => [
                                ['score' => 10.0, 'label' => 'Có hợp đồng liên kết bao tiêu ổn định ≥ 50% sản lượng (WinMart, Co.opmart 4.720 tấn/năm)'],
                                ['score' => 7.0, 'label' => 'Có hợp đồng liên kết từng vụ hoặc tiêu thụ từ 30% đến dưới 50% sản lượng'],
                                ['score' => 3.0, 'label' => 'Liên kết tiêu thụ tự do, tỷ lệ dưới 30% sản lượng'],
                                ['score' => 0.0, 'label' => 'Chưa có hợp đồng hoặc liên kết tiêu thụ chuỗi'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'TC-A.4',
                        'name' => 'Bảo vệ môi trường trong sản xuất',
                        'description' => 'Cam kết bảo vệ môi trường, thu gom bao bì thuốc BVTV và xử lý phụ phẩm hữu cơ khép kín',
                        'max_score' => 15.0,
                        'mandatory' => true,
                        'display_order' => 4,
                        'indicator' => [
                            'code' => 'TC-A.4.1',
                            'name' => 'Cam kết BVMT, thu gom bao gói BVTV và xử lý phụ phẩm hữu cơ',
                            'description' => 'Bản cam kết bảo vệ môi trường được cấp xã xác nhận, có bể thu gom bao bì BVTV và quy trình ủ phân hữu cơ vi sinh',
                            'max_score' => 15.0,
                            'mandatory' => true,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'ENVIRONMENTAL_COMMITMENT',
                                'description' => 'Bản cam kết bảo vệ môi trường được UBND Phường 12 phê duyệt, hình ảnh bể thu gom bao bì BVTV và chứng từ xử lý phụ phẩm',
                            ],
                            'scoring_rules' => [
                                ['score' => 15.0, 'label' => 'Đầy đủ cam kết BVMT, bể thu gom bao gói BVTV đúng quy cách, 100% phụ phẩm ủ hữu cơ vi sinh khép kín'],
                                ['score' => 11.0, 'label' => 'Đầy đủ cam kết BVMT, có bể thu gom bao gói, xử lý phụ phẩm đạt yêu cầu'],
                                ['score' => 6.0, 'label' => 'Có cam kết BVMT nhưng việc thu gom xử lý phụ phẩm chưa triệt để'],
                                ['score' => 0.0, 'label' => 'Chưa có cam kết BVMT hoặc vi phạm quy định về bảo vệ môi trường'],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'group' => [
                    'code' => 'GB',
                    'name' => 'Phần B: Khả năng tiếp thị',
                    'description' => 'Đánh giá kênh phân phối thương mại, bao bì nhãn mác truy xuất nguồn gốc và câu chuyện sản phẩm',
                    'display_order' => 2,
                ],
                'criteria' => [
                    [
                        'code' => 'TC-B.1.1',
                        'name' => 'Hệ thống kênh phân phối thương mại',
                        'description' => 'Năng lực tổ chức thị trường và phân phối bán lẻ đa kênh toàn quốc',
                        'max_score' => 8.0,
                        'mandatory' => false,
                        'display_order' => 1,
                        'indicator' => [
                            'code' => 'TC-B.1.1',
                            'name' => 'Thị trường và hệ thống kênh phân phối bán lẻ / sàn TMĐT',
                            'description' => 'Sản phẩm có mặt tại hệ thống bán lẻ hiện đại (siêu thị, cửa hàng tiện lợi) và sàn thương mại điện tử',
                            'max_score' => 8.0,
                            'mandatory' => false,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'DISTRIBUTION_CHANNEL',
                                'description' => 'Hợp đồng thương mại siêu thị WinMart, Bách Hóa Xanh, gian hàng sàn TMĐT OCOP và hóa đơn bán lẻ',
                            ],
                            'scoring_rules' => [
                                ['score' => 8.0, 'label' => 'Phân phối tại hệ thống siêu thị toàn quốc và sàn TMĐT OCOP chính thức'],
                                ['score' => 5.0, 'label' => 'Phân phối tại chuỗi cửa hàng tiện lợi và đại lý cấp tỉnh / vùng'],
                                ['score' => 2.0, 'label' => 'Bán lẻ qua chợ truyền thống và thương lái nhỏ lẻ'],
                                ['score' => 0.0, 'label' => 'Chưa có hệ thống phân phối thương mại ổn định'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'TC-B.1.2',
                        'name' => 'Bao bì đóng gói & Tem nhãn truy xuất nguồn gốc',
                        'description' => 'Tuân thủ ghi nhãn hàng hóa Nghị định 43/2017/NĐ-CP và có tem mã QR gắn mã lô',
                        'max_score' => 7.0,
                        'mandatory' => true,
                        'display_order' => 2,
                        'indicator' => [
                            'code' => 'TC-B.1.2',
                            'name' => 'Bao bì đạt chuẩn ghi nhãn và có mã QR truy xuất nguồn gốc lô hàng',
                            'description' => 'Bao bì thân thiện môi trường, đầy đủ thông tin bắt buộc và tem QR truy xuất nguồn gốc từng lô sản phẩm',
                            'max_score' => 7.0,
                            'mandatory' => true,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'PACKAGING_AND_QR_LABEL',
                                'description' => 'Mẫu bao bì túi sinh học / khay giấy, tem nhãn GS1 có mã QR liên kết mã lô lot_id',
                            ],
                            'scoring_rules' => [
                                ['score' => 7.0, 'label' => 'Bao bì chuẩn NĐ 43/2017 & TT 02/2024, có tem QR gắn mã lô (lot_id) truy xuất 10 trường dữ liệu'],
                                ['score' => 5.0, 'label' => 'Bao bì đạt chuẩn ghi nhãn, có tem QR thông tin cơ bản'],
                                ['score' => 2.0, 'label' => 'Bao bì có nhãn hàng hóa thông thường, chưa có mã QR truy xuất'],
                                ['score' => 0.0, 'label' => 'Bao bì thô sơ không có nhãn mác đúng quy định'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'TC-B.2',
                        'name' => 'Câu chuyện về sản phẩm',
                        'description' => 'Nội dung và hình thức thể hiện câu chuyện văn hóa, đặc trưng nông sản Đà Lạt',
                        'max_score' => 10.0,
                        'mandatory' => false,
                        'display_order' => 3,
                        'indicator' => [
                            'code' => 'TC-B.2.1',
                            'name' => 'Nội dung & Hình thức thể hiện câu chuyện sản phẩm văn hóa nông sản',
                            'description' => 'Câu chuyện sản phẩm nêu bật nguồn gốc giống ớt Palermo, di sản khí hậu cao nguyên Đà Lạt và công sức nông dân',
                            'max_score' => 10.0,
                            'mandatory' => false,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'PRODUCT_STORY',
                                'description' => 'Bản thuyết minh câu chuyện sản phẩm kèm phóng sự ảnh, video truyền thông và tờ rơi quảng bá',
                            ],
                            'scoring_rules' => [
                                ['score' => 10.0, 'label' => 'Câu chuyện sâu sắc về di sản rau Đà Lạt, nguồn gốc giống Sweet Palermo, có ảnh/video chuyên nghiệp'],
                                ['score' => 8.0, 'label' => 'Câu chuyện đầy đủ, hấp dẫn, có hình ảnh minh họa thực tế'],
                                ['score' => 5.0, 'label' => 'Câu chuyện sản phẩm đạt yêu cầu cơ bản về nguồn gốc'],
                                ['score' => 1.0, 'label' => 'Giới thiệu sơ sài, chưa nổi bật tính độc đáo'],
                                ['score' => 0.0, 'label' => 'Chưa có câu chuyện sản phẩm'],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'group' => [
                    'code' => 'GC',
                    'name' => 'Phần C: Chất lượng sản phẩm',
                    'description' => 'Đánh giá chỉ tiêu cảm quan dinh dưỡng, tiêu chuẩn VietGAP/ATTP, kiểm soát tồn dư thuốc BVTV và nhãn hiệu bảo hộ',
                    'display_order' => 3,
                ],
                'criteria' => [
                    [
                        'code' => 'TC-C.1',
                        'name' => 'Chỉ tiêu cảm quan, dinh dưỡng & độc đáo',
                        'description' => 'Độ ngọt Brix, màu sắc, vị giòn ngọt thanh và phiếu kiểm nghiệm dinh dưỡng ISO 17025',
                        'max_score' => 10.0,
                        'mandatory' => false,
                        'display_order' => 1,
                        'indicator' => [
                            'code' => 'TC-C.1.1',
                            'name' => 'Chỉ tiêu cảm quan, độ ngọt Brix ≥ 8.0 & kiểm nghiệm dinh dưỡng ISO 17025',
                            'description' => 'Ớt chuông Sweet Palermo Đỏ có hình dáng thuôn dài đặc trưng, độ ngọt Brix cao ≥ 8.0, giàu vitamin C và chất chống oxy hóa',
                            'max_score' => 10.0,
                            'mandatory' => false,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'TEST_RESULT_CERTIFICATE',
                                'description' => 'Phiếu kết quả thử nghiệm Quatest 3 / Eurofins phân tích độ Brix, hàm lượng đường tự nhiên, Vitamin C và kim loại nặng',
                            ],
                            'scoring_rules' => [
                                ['score' => 10.0, 'label' => 'Độ Brix ≥ 8.0, màu đỏ tự nhiên, vị ngọt thanh không hăng, có phiếu kiểm nghiệm ISO 17025'],
                                ['score' => 8.0, 'label' => 'Độ Brix từ 7.0 đến dưới 8.0, cảm quan đạt chuẩn, có phiếu phân tích'],
                                ['score' => 5.0, 'label' => 'Chỉ tiêu cảm quan đạt chuẩn thông thường'],
                                ['score' => 0.0, 'label' => 'Chưa có kiểm nghiệm hoặc chất lượng cảm quan không đạt'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'TC-C.2.1',
                        'name' => 'Tiêu chuẩn chất lượng VietGAP / GlobalGAP',
                        'description' => 'Chứng nhận quy trình thực hành nông nghiệp tốt VietGAP / GlobalGAP còn thời hạn hiệu lực',
                        'max_score' => 10.0,
                        'mandatory' => true,
                        'display_order' => 2,
                        'indicator' => [
                            'code' => 'TC-C.2.1',
                            'name' => 'Giấy chứng nhận VietGAP hoặc tương đương còn hiệu lực',
                            'description' => 'Chứng nhận VietGAP số hiệu VICB-2024-GAP-0128 cấp cho HTX Tân Tiến, có giá trị đến năm 2027',
                            'max_score' => 10.0,
                            'mandatory' => true,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'VIETGAP_CERTIFICATE',
                                'description' => 'Bản scan Giấy chứng nhận VietGAP VICB-2024-GAP-0128 còn hiệu lực đến năm 2027 và quyết định cấp chứng nhận',
                            ],
                            'scoring_rules' => [
                                ['score' => 10.0, 'label' => 'Có Giấy chứng nhận VietGAP / GlobalGAP còn thời hạn hiệu lực (VICB-2024-GAP-0128 hạn 2027)'],
                                ['score' => 5.0, 'label' => 'Giấy chứng nhận đang trong thời gian nộp hồ sơ gia hạn / tái cấp'],
                                ['score' => 0.0, 'label' => 'Chưa được cấp chứng nhận VietGAP hoặc giấy chứng nhận đã hết hạn'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'TC-C.2.2',
                        'name' => 'Kiểm soát tồn dư thuốc BVTV & PHI',
                        'description' => 'Tuân thủ nghiêm ngặt thời gian cách ly thuốc BVTV (PHI) và kiểm soát tồn dư hóa chất',
                        'max_score' => 5.0,
                        'mandatory' => true,
                        'display_order' => 3,
                        'indicator' => [
                            'code' => 'TC-C.2.2',
                            'name' => 'Tuân thủ thời gian cách ly PHI và kiểm soát an toàn tồn dư BVTV',
                            'description' => 'Sổ nhật ký phun thuốc ghi chép đầy đủ thời gian cách ly PHI, kiểm tra âm tính với các hoạt chất cấm',
                            'max_score' => 5.0,
                            'mandatory' => true,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'PHI_LOG_OR_RESIDUE_TEST',
                                'description' => 'Sổ nhật ký phun thuốc bảo vệ thực vật điện tử, bảng tổng hợp kiểm soát PHI và phiếu kiểm nghiệm tồn dư MRL',
                            ],
                            'scoring_rules' => [
                                ['score' => 5.0, 'label' => '100% diện tích và lô xuất kho tuân thủ thời gian cách ly PHI, âm tính chất cấm, nhật ký đầy đủ'],
                                ['score' => 3.0, 'label' => 'Tuân thủ mức MRL quy định nhưng sổ theo dõi ghi chép chưa liên tục'],
                                ['score' => 0.0, 'label' => 'Vi phạm thời gian cách ly PHI hoặc phát hiện dư lượng hoạt chất vượt ngưỡng'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'TC-C.3',
                        'name' => 'Sở hữu trí tuệ & Nhãn hiệu bảo hộ',
                        'description' => 'Quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt" hoặc văn bằng bảo hộ sở hữu trí tuệ',
                        'max_score' => 10.0,
                        'mandatory' => false,
                        'display_order' => 4,
                        'indicator' => [
                            'code' => 'TC-C.3.1',
                            'name' => 'Văn bằng bảo hộ sở hữu trí tuệ / Quyền sử dụng nhãn hiệu chứng nhận',
                            'description' => 'Được UBND Thành phố Đà Lạt / Chi cục Trồng trọt cấp quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt"',
                            'max_score' => 10.0,
                            'mandatory' => false,
                            'display_order' => 1,
                            'evidence_requirement' => [
                                'type' => 'IP_TRADEMARK_CERTIFICATE',
                                'description' => 'Giấy chứng nhận quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt" hoặc Giấy chứng nhận đăng ký nhãn hiệu độc quyền',
                            ],
                            'scoring_rules' => [
                                ['score' => 10.0, 'label' => 'Được cấp quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt" hoặc nhãn hiệu độc quyền bảo hộ'],
                                ['score' => 6.0, 'label' => 'Đã nộp đơn hợp lệ và đang chờ cấp văn bằng bảo hộ'],
                                ['score' => 0.0, 'label' => 'Chưa đăng ký sở hữu trí tuệ hoặc nhãn hiệu chứng nhận'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        // 4. Insert Groups, Criteria, Indicators, and Scoring Rules
        $rulePriority = 1;
        foreach ($structure as $gData) {
            $group = CriteriaGroupModel::create([
                'id' => (string) Str::uuid(),
                'criteria_version_id' => $version->id,
                'code' => $gData['group']['code'],
                'name' => $gData['group']['name'],
                'description' => $gData['group']['description'],
                'display_order' => $gData['group']['display_order'],
            ]);

            foreach ($gData['criteria'] as $cData) {
                $criterion = CriterionModel::create([
                    'id' => (string) Str::uuid(),
                    'criteria_group_id' => $group->id,
                    'code' => $cData['code'],
                    'name' => $cData['name'],
                    'description' => $cData['description'],
                    'max_score' => $cData['max_score'],
                    'mandatory' => $cData['mandatory'],
                    'display_order' => $cData['display_order'],
                ]);

                $iData = $cData['indicator'];
                $indicator = IndicatorModel::create([
                    'id' => (string) Str::uuid(),
                    'criterion_id' => $criterion->id,
                    'code' => $iData['code'],
                    'name' => $iData['name'],
                    'description' => $iData['description'],
                    'max_score' => $iData['max_score'],
                    'mandatory' => $iData['mandatory'],
                    'evidence_requirement' => $iData['evidence_requirement'],
                    'display_order' => $iData['display_order'],
                ]);

                // Create Scoring Rule for this indicator
                ScoringRuleModel::create([
                    'id' => (string) Str::uuid(),
                    'criteria_version_id' => $version->id,
                    'rule_code' => "RULE-{$iData['code']}",
                    'rule_type' => 'STEP_RATING',
                    'configuration' => [
                        'indicator_code' => $iData['code'],
                        'indicator_id' => $indicator->id,
                        'criterion_code' => $cData['code'],
                        'max_score' => $iData['max_score'],
                        'steps' => $iData['scoring_rules'],
                    ],
                    'priority' => $rulePriority++,
                    'status' => 'ACTIVE',
                ]);
            }
        }

        // 5. Create 6 Mandatory Conditions (Điều kiện khống chế)
        $mandatoryConditions = [
            [
                'condition_code' => 'COND-VIETGAP-MANDATORY',
                'name' => 'Điều kiện khống chế 4 sao: Tiêu chuẩn VietGAP / GlobalGAP',
                'description' => 'Để đạt 4 sao trở lên, sản phẩm bắt buộc phải có Giấy chứng nhận VietGAP còn hiệu lực (điểm TC-C.2.1 = 10.0đ). Nếu không đạt, hồ sơ tự động bị hạ xuống tối đa 3 sao.',
                'condition_type' => 'BLOCKING_FOR_STAR',
                'configuration' => [
                    'target_star' => '4_STAR',
                    'downgrade_target' => '3_STAR',
                    'required_indicator' => 'TC-C.2.1',
                    'min_score' => 10.0,
                    'rule' => 'Bắt buộc có VietGAP/GlobalGAP còn hiệu lực để đạt phân hạng 4 sao trở lên',
                ],
                'blocking' => false,
            ],
            [
                'condition_code' => 'COND-ENVIRONMENT-MANDATORY',
                'name' => 'Điều kiện khống chế nộp hồ sơ: Cam kết Bảo vệ Môi trường',
                'description' => 'Bắt buộc đạt điểm tối thiểu 6.0 điểm tại chỉ tiêu TC-A.4.1 và có bản cam kết BVMT được cấp xã xác nhận trước khi nộp hồ sơ.',
                'condition_type' => 'BLOCKING_FOR_SUBMIT',
                'configuration' => [
                    'required_indicator' => 'TC-A.4.1',
                    'min_score' => 6.0,
                    'rule' => 'Phải có cam kết BVMT và đạt tối thiểu 6.0 điểm môi trường để nộp hồ sơ',
                ],
                'blocking' => true,
            ],
            [
                'condition_code' => 'COND-RAW-MATERIAL-MINIMUM',
                'name' => 'Điều kiện khống chế nguyên liệu địa phương tối thiểu',
                'description' => 'Tỷ lệ nguyên liệu tại chỗ phải đạt tối thiểu 50% (TC-A.1.1 ≥ 5.0đ) đối với 3 sao và tối thiểu 70% (TC-A.1.1 ≥ 7.0đ) đối với 4 sao.',
                'condition_type' => 'BLOCKING_FOR_STAR',
                'configuration' => [
                    'required_indicator' => 'TC-A.1.1',
                    'min_score_3_star' => 5.0,
                    'min_score_4_star' => 7.0,
                    'rule' => 'Tối thiểu 50% nguyên liệu địa phương cho 3 sao, 70% cho 4 sao',
                ],
                'blocking' => true,
            ],
            [
                'condition_code' => 'COND-PACKAGING-QR-MANDATORY',
                'name' => 'Điều kiện khống chế nộp hồ sơ: Bao bì & Tem QR truy xuất',
                'description' => 'Bắt buộc có bao bì đúng quy định nhãn hàng hóa và tem QR liên kết mã lô (TC-B.1.2 ≥ 5.0đ) trước khi nộp hồ sơ.',
                'condition_type' => 'BLOCKING_FOR_SUBMIT',
                'configuration' => [
                    'required_indicator' => 'TC-B.1.2',
                    'min_score' => 5.0,
                    'rule' => 'Bắt buộc có nhãn mác đúng chuẩn và tem QR truy xuất nguồn gốc',
                ],
                'blocking' => true,
            ],
            [
                'condition_code' => 'COND-FOOD-SAFETY-PHI',
                'name' => 'Điều kiện khống chế an toàn thực phẩm & thời gian cách ly PHI',
                'description' => 'Bắt buộc 100% lô xuất kho phải tuân thủ thời gian cách ly PHI và âm tính hoạt chất cấm (TC-C.2.2 = 5.0đ).',
                'condition_type' => 'BLOCKING_FOR_STAR',
                'configuration' => [
                    'required_indicator' => 'TC-C.2.2',
                    'min_score' => 5.0,
                    'rule' => 'Tuân thủ 100% thời gian cách ly thuốc BVTV (PHI), không tồn dư chất cấm',
                ],
                'blocking' => true,
            ],
            [
                'condition_code' => 'COND-COMPLETENESS-100',
                'name' => 'Điều kiện khống chế hoàn thiện 100% hồ sơ trước khi nộp',
                'description' => 'Tỷ lệ hoàn thành hồ sơ (Completion Rate) phải đạt 100% (tự chấm đủ 11/11 chỉ tiêu và gắn đủ minh chứng bắt buộc). Nút nộp hồ sơ bị khóa nếu CR < 100%.',
                'condition_type' => 'BLOCKING_FOR_SUBMIT',
                'configuration' => [
                    'min_completion_rate' => 100.0,
                    'required_assessed_indicators_count' => 11,
                    'rule' => 'Khóa nộp hồ sơ nếu chưa tự chấm đủ 11 chỉ tiêu hoặc thiếu minh chứng bắt buộc',
                ],
                'blocking' => true,
            ],
        ];

        foreach ($mandatoryConditions as $mCond) {
            MandatoryConditionModel::create([
                'id' => (string) Str::uuid(),
                'criteria_version_id' => $version->id,
                'condition_code' => $mCond['condition_code'],
                'name' => $mCond['name'],
                'description' => $mCond['description'],
                'condition_type' => $mCond['condition_type'],
                'configuration' => $mCond['configuration'],
                'blocking' => $mCond['blocking'],
            ]);
        }

        // 6. Auto-publish the criteria version using CriteriaVersionService so it transitions to PUBLISHED
        /** @var CriteriaVersionService $criteriaVersionService */
        $criteriaVersionService = app(CriteriaVersionService::class);
        $criteriaVersionService->publishVersion($version->id);
    }
}
