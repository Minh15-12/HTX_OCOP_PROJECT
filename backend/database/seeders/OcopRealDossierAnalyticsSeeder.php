<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OcopRealDossierAnalyticsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $coopId = 'a60ccf85-7301-43f7-b6d3-b25f72c75b78'; // HTX Nông nghiệp Tân Tiến

        // 1. Ensure Criteria Version
        $criteriaVersion = DB::table('criteria_versions')->where('version_code', 'OCOP-QD148-2023-FRESH')->first();
        if (!$criteriaVersion) {
            $criteriaVersion = DB::table('criteria_versions')->first();
        }
        $cvId = $criteriaVersion ? $criteriaVersion->id : '8f0d542c-df0b-4bd3-8b73-c05d8871845b';

        // 2. Ensure 4 Authentic Products for HTX Tan Tien
        $productDefs = [
            [
                'code' => 'PRD-PALERMO-RED',
                'name' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
                'category' => 'Rau, củ, quả, hạt tươi',
                'brand' => 'Sweet Palermo Đà Lạt - HTX Tân Tiến',
                'specification' => ['weight' => '100g - 150g/trái', 'packaging' => 'Khay sinh học 500g', 'brix' => 9.2],
            ],
            [
                'code' => 'PRD-PALERMO-YEL',
                'name' => 'Ớt chuông Sweet Palermo Vàng Đà Lạt',
                'category' => 'Rau, củ, quả, hạt tươi',
                'brand' => 'Sweet Palermo Đà Lạt - HTX Tân Tiến',
                'specification' => ['weight' => '110g - 160g/trái', 'packaging' => 'Khay sinh học 500g', 'brix' => 9.5],
            ],
            [
                'code' => 'PRD-PALERMO-ORG',
                'name' => 'Ớt chuông Sweet Palermo Cam Đà Lạt',
                'category' => 'Rau, củ, quả, hạt tươi',
                'brand' => 'Sweet Palermo Đà Lạt - HTX Tân Tiến',
                'specification' => ['weight' => '100g - 140g/trái', 'packaging' => 'Khay sinh học 500g', 'brix' => 8.8],
            ],
            [
                'code' => 'PRD-PALERMO-TRIO',
                'name' => 'Hộp quà biếu Nông sản Sweet Palermo Trio (Đỏ - Vàng - Cam)',
                'category' => 'Rau, củ, quả, hạt tươi',
                'brand' => 'Sweet Palermo Đà Lạt - HTX Tân Tiến',
                'specification' => ['weight' => '1.2kg/hộp', 'packaging' => 'Hộp giấy Kraft quai xách sinh học', 'mix' => '3 màu'],
            ],
        ];

        $productIds = [];
        foreach ($productDefs as $p) {
            $existing = DB::table('products')->where('product_code', $p['code'])->first();
            if ($existing) {
                $productIds[$p['code']] = $existing->id;
                DB::table('products')->where('id', $existing->id)->update([
                    'product_name' => $p['name'],
                    'category' => $p['category'],
                    'brand' => $p['brand'],
                    'specification' => json_encode($p['specification']),
                    'status' => 'ACTIVE',
                    'updated_at' => $now,
                ]);
            } else {
                $pId = (string) Str::uuid();
                DB::table('products')->insert([
                    'id' => $pId,
                    'cooperative_id' => $coopId,
                    'product_code' => $p['code'],
                    'product_name' => $p['name'],
                    'category' => $p['category'],
                    'brand' => $p['brand'],
                    'specification' => json_encode($p['specification']),
                    'quality_information' => json_encode(['standard' => 'VietGAP', 'cert_no' => 'VietGAP-TT-2024-089']),
                    'status' => 'ACTIVE',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $productIds[$p['code']] = $pId;
            }
        }

        // 3. Fetch Indicators Map
        $indicators = DB::table('indicators')->pluck('id', 'code')->toArray();

        // 4. Define 4 Realistic OCOP Applications
        $applicationsData = [
            [
                'app_number' => 'OCOP-2026-DALAT-001',
                'product_code' => 'PRD-PALERMO-RED',
                'status' => 'APPROVED',
                'target_star' => 4,
                'submitted_at' => '2026-01-12 09:00:00',
                'completed_at' => '2026-01-15 16:30:00',
                'scores' => [
                    'TC-A.1.1' => [10.0, '100% diện tích canh tác (28.5 ha) thuộc vùng trồng Đạ Sar & Phường 12 Đà Lạt của xã viên HTX.'],
                    'TC-A.2.1' => [5.0, '100% xã viên và nhân công thu hoạch là lao động thường trú địa phương, thu nhập bình quân 12.5 triệu/tháng.'],
                    'TC-A.3.1' => [10.0, 'Ký hợp đồng liên kết bao tiêu chuỗi giá trị dài hạn với hệ thống WinMart và Co.opmart sản lượng 4.720 tấn/năm.'],
                    'TC-A.4.1' => [12.0, 'Cam kết BVMT, toàn bộ bao bì thuốc BVTV thu gom vào bể chứa chuẩn và phụ phẩm ớt ủ phân hữu cơ compost.'],
                    'TC-B.1.1' => [7.0, 'Sản phẩm phân phối rộng rãi tại hơn 120 siêu thị WinMart và sàn thương mại điện tử Tiki, ShopeeFarm.'],
                    'TC-B.1.2' => [7.0, 'Bao bì in tem mã QR truy xuất nguồn gốc nông sản VietGAP và mã số vùng trồng được Cục BVTV cấp.'],
                    'TC-B.2.1' => [7.0, 'Có tài liệu giới thiệu câu chuyện nông sản Sweet Palermo canh tác nhà kính công nghệ cao xứ lạnh Đà Lạt.'],
                    'TC-C.1.1' => [9.0, 'Độ ngọt Brix trung bình đạt 9.2, hàm lượng Vitamin C cao gấp 3 lần cam tươi theo phiếu thử nghiệm TTKT3.'],
                    'TC-C.2.1' => [10.0, 'Chứng nhận VietGAP số VietGAP-TT-2024-089 cấp ngày 15/06/2024 có hiệu lực đến ngày 15/06/2027.'],
                    'TC-C.2.2' => [5.0, 'Tuân thủ thời gian cách ly PHI tối thiểu 14 ngày trước thu hoạch, kiểm nghiệm tồn dư hóa chất đạt chuẩn an toàn.'],
                    'TC-C.3.1' => [4.5, 'Đã nộp đơn đăng ký bảo hộ nhãn hiệu tập thể "Ớt chuông Sweet Palermo Tân Tiến" tại Cục Sở hữu Trí tuệ.'],
                ],
                'decision' => [
                    'number' => 'QĐ-UBND-2026-089',
                    'date' => '2026-01-15',
                    'classification' => 'FOUR_STAR',
                    'issuer' => 'UBND Tỉnh Lâm Đồng',
                    'signer' => 'Nguyễn Văn Yên - Phó Chủ tịch UBND Tỉnh',
                ],
            ],
            [
                'app_number' => 'OCOP-2026-DALAT-002',
                'product_code' => 'PRD-PALERMO-YEL',
                'status' => 'SUBMITTED',
                'target_star' => 4,
                'submitted_at' => '2026-02-10 08:30:00',
                'completed_at' => null,
                'scores' => [
                    'TC-A.1.1' => [10.0, 'Vùng trồng ớt chuông vàng 18.0 ha tập trung tại xã Đạ Sar, năng suất 140 tấn/ha/năm.'],
                    'TC-A.2.1' => [5.0, 'Lao động địa phương chiếm 92% lực lượng sơ chế đóng gói.'],
                    'TC-A.3.1' => [10.0, 'Hợp đồng liên kết tiêu thụ với chuỗi cửa hàng thực phẩm sạch Bách Hóa Xanh và Big C.'],
                    'TC-A.4.1' => [9.0, 'Có quy trình thu gom bao bì BVTV nhưng đang nâng cấp khu ủ phân hữu cơ vi sinh.'],
                    'TC-B.1.1' => [6.5, 'Kênh phân phối phủ kín các đô thị lớn tại TP.HCM, Hà Nội và Đà Nẵng.'],
                    'TC-B.1.2' => [7.0, 'Nhãn hàng hóa và mã số vùng trồng VN-LDO-0089 hiển thị đầy đủ trên từng túi zip.'],
                    'TC-B.2.1' => [5.0, 'Câu chuyện sản phẩm đã có bản thảo nhưng chưa xuất bản video giới thiệu trên kênh truyền thông.'],
                    'TC-C.1.1' => [9.5, 'Độ ngọt Brix đạt 9.5, màu vàng rực rỡ đặc trưng của giống F1 Rijk Zwaan.'],
                    'TC-C.2.1' => [10.0, 'Chứng nhận VietGAP đầy đủ cùng tổ hợp vùng trồng HTX Tân Tiến.'],
                    'TC-C.2.2' => [5.0, 'Nhật ký điện tử ghi nhận PHI an toàn 100% trước khi cắt cành.'],
                    'TC-C.3.1' => [1.5, 'Sử dụng nhãn hiệu chung của HTX, đang chuẩn bị hồ sơ bảo hộ kiểu dáng.'],
                ],
                'decision' => null,
            ],
            [
                'app_number' => 'OCOP-2026-DALAT-003',
                'product_code' => 'PRD-PALERMO-ORG',
                'status' => 'SELF_EVALUATING',
                'target_star' => 4,
                'submitted_at' => null,
                'completed_at' => null,
                'scores' => [
                    'TC-A.1.1' => [10.0, 'Vùng trồng ớt chuông cam 12.0 ha tại Tổ Hòn Bồ, Phường 12 Đà Lạt.'],
                    'TC-A.2.1' => [5.0, '100% xã viên HTX trực tiếp đứng vườn canh tác.'],
                    'TC-A.3.1' => [8.0, 'Đang đàm phán hợp đồng cung ứng 30 tấn/tháng cho chuỗi nhà hàng ẩm thực Nhật Bản.'],
                    'TC-A.4.1' => [9.0, 'Thực hiện thu gom rác thải nông nghiệp đúng quy định.'],
                    'TC-B.1.1' => [5.0, 'Bán sỉ tại chợ đầu mối nông sản và một số cửa hàng trái cây cao cấp.'],
                    'TC-B.1.2' => [6.0, 'Tem nhãn đạt chuẩn, đang tích hợp mã truy xuất lô thu hoạch thời gian thực.'],
                    'TC-B.2.1' => [5.0, 'Đang xây dựng câu chuyện ớt chuông cam giàu Beta-Carotene.'],
                    'TC-C.1.1' => [8.5, 'Độ ngọt Brix 8.8, thịt quả dày giòn ngọt, đạt chuẩn cảm quan.'],
                    'TC-C.2.1' => [10.0, 'Đã được cấp chứng nhận VietGAP đồng bộ toàn HTX.'],
                    'TC-C.2.2' => [5.0, 'Kiểm soát nghiêm ngặt danh mục phân bón và thuốc BVTV sinh học.'],
                    'TC-C.3.1' => [0.5, 'Chưa đăng ký văn bằng bảo hộ riêng cho dòng sản phẩm cam.'],
                ],
                'decision' => null,
            ],
            [
                'app_number' => 'OCOP-2026-DALAT-004',
                'product_code' => 'PRD-PALERMO-TRIO',
                'status' => 'DRAFT',
                'target_star' => 4,
                'submitted_at' => null,
                'completed_at' => null,
                'scores' => [
                    'TC-A.1.1' => [10.0, 'Toàn bộ 3 màu ớt thu hoạch từ vùng nhà kính công nghệ cao của HTX Tân Tiến.'],
                    'TC-A.2.1' => [4.0, 'Tổ sơ chế phân loại quả đều là con em xã viên địa phương.'],
                    'TC-A.3.1' => [4.0, 'Dòng sản phẩm hộp quà biếu cao cấp phục vụ dịp Lễ, Tết và khách du lịch Đà Lạt.'],
                    'TC-A.4.1' => [4.0, 'Khay bao bì sử dụng bã mía ép thân thiện môi trường.'],
                    'TC-B.1.1' => [3.0, 'Đang thử nghiệm phân phối tại các trạm dừng chân du lịch và showroom HTX.'],
                    'TC-B.1.2' => [3.0, 'Mẫu thiết kế hộp quà đang trong giai đoạn hoàn thiện.'],
                    'TC-B.2.1' => [4.0, 'Ý tưởng câu chuyện "Tam sắc ngọt lành từ đất sương mù".'],
                    'TC-C.1.1' => [5.0, 'Đạt chuẩn cảm quan 3 màu sắc đồng đều, cuống xanh tươi.'],
                    'TC-C.2.1' => [5.0, 'Thu hoạch từ các luống đạt chuẩn VietGAP.'],
                    'TC-C.2.2' => [4.0, 'Tuân thủ quy chuẩn an toàn thực phẩm.'],
                    'TC-C.3.1' => [2.0, 'Đang đăng ký mẫu mã hộp quà biếu.'],
                ],
                'decision' => null,
            ],
        ];

        // 5. Insert or Update Applications & Self Assessments
        foreach ($applicationsData as $appData) {
            $existingApp = DB::table('ocop_applications')->where('application_number', $appData['app_number'])->first();
            $productId = $productIds[$appData['product_code']];

            if ($existingApp) {
                $appId = $existingApp->id;
                DB::table('ocop_applications')->where('id', $appId)->update([
                    'product_id' => $productId,
                    'criteria_version_id' => $cvId,
                    'status' => $appData['status'],
                    'submitted_at' => $appData['submitted_at'],
                    'completed_at' => $appData['completed_at'],
                    'updated_at' => $now,
                ]);
            } else {
                $appId = (string) Str::uuid();
                DB::table('ocop_applications')->insert([
                    'id' => $appId,
                    'cooperative_id' => $coopId,
                    'product_id' => $productId,
                    'criteria_version_id' => $cvId,
                    'application_number' => $appData['app_number'],
                    'application_type' => 'NEW_EVALUATION',
                    'status' => $appData['status'],
                    'submitted_at' => $appData['submitted_at'],
                    'completed_at' => $appData['completed_at'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // Clean & Insert Self Assessments
            DB::table('self_assessments')->where('application_id', $appId)->delete();
            foreach ($appData['scores'] as $indCode => $scoreInfo) {
                if (isset($indicators[$indCode])) {
                    DB::table('self_assessments')->insert([
                        'id' => (string) Str::uuid(),
                        'application_id' => $appId,
                        'indicator_id' => $indicators[$indCode],
                        'score' => $scoreInfo[0],
                        'explanation' => $scoreInfo[1],
                        'status' => 'COMPLETED',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            // Handle Final Decision
            if ($appData['decision']) {
                $decInfo = $appData['decision'];
                $existingDec = DB::table('final_decisions')->where('application_id', $appId)->first();
                if ($existingDec) {
                    DB::table('final_decisions')->where('id', $existingDec->id)->update([
                        'decision_number' => $decInfo['number'],
                        'decision_date' => $decInfo['date'],
                        'final_classification' => $decInfo['classification'],
                        'effective_date' => $decInfo['date'],
                        'authority_reference' => json_encode([
                            'issuer' => $decInfo['issuer'],
                            'level' => 'PROVINCIAL',
                            'signer' => $decInfo['signer'],
                        ]),
                        'document_reference' => json_encode([
                            'certificate_number' => 'OCOP-LD-2026-089',
                            'valid_until' => '2029-01-15',
                        ]),
                        'status' => 'ISSUED',
                        'updated_at' => $now,
                    ]);
                } else {
                    DB::table('final_decisions')->insert([
                        'id' => (string) Str::uuid(),
                        'application_id' => $appId,
                        'decision_number' => $decInfo['number'],
                        'decision_date' => $decInfo['date'],
                        'final_classification' => $decInfo['classification'],
                        'effective_date' => $decInfo['date'],
                        'authority_reference' => json_encode([
                            'issuer' => $decInfo['issuer'],
                            'level' => 'PROVINCIAL',
                            'signer' => $decInfo['signer'],
                        ]),
                        'document_reference' => json_encode([
                            'certificate_number' => 'OCOP-LD-2026-089',
                            'valid_until' => '2029-01-15',
                        ]),
                        'status' => 'ISSUED',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }
}
