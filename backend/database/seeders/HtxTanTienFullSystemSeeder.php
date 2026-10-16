<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HtxTanTienFullSystemSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $coopId = 'a60ccf85-7301-43f7-b6d3-b25f72c75b78';

        // 1. Cooperative: HTX Nông Nghiệp Tân Tiến
        $coop = DB::table('cooperatives')->where('id', $coopId)->first();
        $coopData = [
            'id' => $coopId,
            'cooperative_code' => 'HTX-TANTIEN-01',
            'legal_name' => 'Hợp tác xã Nông nghiệp Tân Tiến',
            'display_name' => 'HTX Nông nghiệp Tân Tiến',
            'status' => 'ACTIVE',
            'legal_information' => json_encode([
                'registration_number' => '4201089234',
                'tax_code' => '5801458921',
                'representative_name' => 'Mai Văn Tân',
                'representative_title' => 'Chủ tịch HĐQT kiêm Giám đốc',
                'charter_capital' => 2500000000,
                'established_date' => '2018-04-15',
                'business_sectors' => [
                    'Trồng trọt rau, củ, quả công nghệ cao',
                    'Dịch vụ cung ứng vật tư nông nghiệp & phân bón sinh học',
                    'Sơ chế, đóng gói & bao tiêu nông sản OCOP xuất khẩu'
                ]
            ]),
            'contact_information' => json_encode([
                'phone_number' => '02633829988',
                'hotline' => '0918234567',
                'email' => 'info@htxtantien.vn',
                'website' => 'https://htxtantien.vn',
                'address' => 'Số 12 Hòn Bồ, Phường 12, Thành phố Đà Lạt, Tỉnh Lâm Đồng',
            ]),
            'updated_at' => $now,
        ];

        if ($coop) {
            DB::table('cooperatives')->where('id', $coopId)->update($coopData);
        } else {
            $coopData['created_at'] = $now;
            DB::table('cooperatives')->insert($coopData);
        }

        // Clean tear-down in reverse foreign-key order
        DB::table('product_lots')->delete();
        DB::table('final_decisions')->delete();
        DB::table('evaluation_sessions')->delete();
        DB::table('ocop_applications')->delete();
        DB::table('lots')->delete();
        DB::table('harvests')->delete();
        DB::table('farming_logs')->delete();
        DB::table('debt_settlements')->delete();
        DB::table('stock_issue_lines')->delete();
        DB::table('stock_issues')->delete();
        DB::table('stock_receipt_lines')->delete();
        DB::table('stock_receipts')->delete();
        DB::table('receivable_payables')->where('cooperative_id', $coopId)->delete();
        DB::table('cash_transactions')->where('cooperative_id', $coopId)->delete();
        DB::table('materials')->where('cooperative_id', $coopId)->delete();
        DB::table('products')->where('cooperative_id', $coopId)->delete();
        DB::table('member_plot_assignments')->delete();
        DB::table('crop_seasons')->delete();
        DB::table('farm_plots')->delete();
        DB::table('capital_contributions')->delete();
        DB::table('production_units')->where('cooperative_id', $coopId)->delete();
        DB::table('warehouses')->where('cooperative_id', $coopId)->delete();

        // 2. Members (40 Xã viên đầy đủ phân loại, địa phương, và FSM states)
        $names = [
            ['Nguyễn Văn A', 'Nam', '1985-04-12', 'OFFICIAL', 'ACTIVE', 50000000, 50000000, 25000000, 'Thôn 2, Xã Mê Linh, Huyện Lâm Hà'],
            ['Trần Thị B', 'Nữ', '1990-08-20', 'OFFICIAL', 'ACTIVE', 50000000, 40000000, 20000000, 'Thôn 1, Xã Tân Hà, Huyện Lâm Hà'],
            ['Lê Văn C', 'Nam', '1982-11-05', 'OFFICIAL', 'ACTIVE', 100000000, 100000000, 35000000, 'Thôn 4, Xã Mê Linh, Huyện Lâm Hà'],
            ['Phạm Thị D', 'Nữ', '1992-06-18', 'ASSOCIATED', 'ACTIVE', 25000000, 25000000, 15000000, 'Thôn 3, Xã Gia Lâm, Huyện Lâm Hà'],
            ['Hoàng Văn E', 'Nam', '1988-09-25', 'OFFICIAL', 'ACTIVE', 30000000, 15000000, 15000000, 'Thôn 5, Xã Tân Văn, Huyện Lâm Hà'],
            ['Đặng Thị Mai', 'Nữ', '1995-03-14', 'ASSOCIATED', 'ACTIVE', 20000000, 20000000, 10000000, 'Khu Hòn Bồ, Phường 12, TP. Đà Lạt'],
            ['Vũ Đình Trọng', 'Nam', '1979-12-08', 'OFFICIAL', 'ACTIVE', 60000000, 60000000, 30000000, 'Xã Đạ Sar, Huyện Lạc Dương'],
            ['Bùi Thanh Thảo', 'Nữ', '1993-05-30', 'ASSOCIATED', 'PROSPECTIVE', 30000000, 0, 0, 'Thôn 1, Xã Đạ Sar, Huyện Lạc Dương'],
            ['Ngô Quang Khải', 'Nam', '1986-10-18', 'OFFICIAL', 'PROSPECTIVE', 20000000, 0, 0, 'Xã Trạm Hành, TP. Đà Lạt'],
            ['Lâm Văn Hùng', 'Nam', '1975-02-28', 'OFFICIAL', 'SUSPENDED', 20000000, 20000000, 0, 'Thôn 3, Xã Tân Hà, Huyện Lâm Hà'],
            ['Đỗ Quốc Tuấn', 'Nam', '1983-07-15', 'OFFICIAL', 'ACTIVE', 40000000, 40000000, 20000000, 'Khu Thái Phiên, Phường 12, TP. Đà Lạt'],
            ['Nguyễn Thị Lan', 'Nữ', '1991-03-22', 'OFFICIAL', 'ACTIVE', 35000000, 35000000, 15000000, 'Khu Đa Thiện, Phường 8, TP. Đà Lạt'],
            ['Trương Văn Hòa', 'Nam', '1980-09-10', 'OFFICIAL', 'ACTIVE', 50000000, 50000000, 25000000, 'Xã Xuân Thọ, TP. Đà Lạt'],
            ['Lê Thị Hồng', 'Nữ', '1994-11-28', 'ASSOCIATED', 'ACTIVE', 20000000, 20000000, 10000000, 'Xã Đạ Nhim, Huyện Lạc Dương'],
            ['Phan Đình Giáp', 'Nam', '1987-01-19', 'OFFICIAL', 'ACTIVE', 45000000, 45000000, 20000000, 'Thôn Đất Làng, Xã Xuân Trường, TP. Đà Lạt'],
            ['Võ Thị Thu Hà', 'Nữ', '1996-08-04', 'ASSOCIATED', 'ACTIVE', 25000000, 25000000, 15000000, 'Phường 11, TP. Đà Lạt'],
            ['Bùi Văn Khánh', 'Nam', '1978-05-16', 'OFFICIAL', 'ACTIVE', 80000000, 80000000, 40000000, 'Khu Hòn Bồ, Phường 12, TP. Đà Lạt'],
            ['Dương Mỹ Linh', 'Nữ', '1993-12-12', 'OFFICIAL', 'ACTIVE', 30000000, 30000000, 15000000, 'Xã Lát, Huyện Lạc Dương'],
            ['Mai Văn Long', 'Nam', '1984-06-25', 'OFFICIAL', 'ACTIVE', 50000000, 50000000, 25000000, 'Xã Ka Đô, Huyện Đơn Dương'],
            ['Tô Thị Ngọc Bích', 'Nữ', '1990-02-14', 'ASSOCIATED', 'ACTIVE', 20000000, 20000000, 10000000, 'Thị trấn Thạnh Mỹ, Huyện Đơn Dương'],
            ['Đoàn Minh Trí', 'Nam', '1981-10-09', 'OFFICIAL', 'ACTIVE', 70000000, 70000000, 35000000, 'Thôn 1, Xã Gia Hiệp, Huyện Di Linh'],
            ['Phạm Hải Yến', 'Nữ', '1995-07-27', 'ASSOCIATED', 'PROSPECTIVE', 25000000, 0, 0, 'Phường 9, TP. Đà Lạt'],
            ['Đinh Trọng Hưng', 'Nam', '1989-04-03', 'OFFICIAL', 'ACTIVE', 40000000, 40000000, 20000000, 'Xã Tà Nung, TP. Đà Lạt'],
            ['Chu Thị Phương', 'Nữ', '1992-09-17', 'OFFICIAL', 'ACTIVE', 35000000, 35000000, 15000000, 'Xã Nam Hà, Huyện Lâm Hà'],
            ['Hồ Văn Dũng', 'Nam', '1986-12-30', 'OFFICIAL', 'ACTIVE', 50000000, 50000000, 25000000, 'Xã Đạ Sar, Huyện Lạc Dương'],
            ['Lương Thị Thắm', 'Nữ', '1997-03-08', 'ASSOCIATED', 'ACTIVE', 20000000, 20000000, 10000000, 'Thôn Phát Chi, Xã Trạm Hành, TP. Đà Lạt'],
            ['Tạ Quang Dũng', 'Nam', '1976-11-21', 'OFFICIAL', 'ACTIVE', 60000000, 60000000, 30000000, 'Xã Phi Tô, Huyện Lâm Hà'],
            ['Nghiêm Xuân Trường', 'Nam', '1985-08-11', 'OFFICIAL', 'ACTIVE', 45000000, 45000000, 20000000, 'Phường 7, TP. Đà Lạt'],
            ['Cao Thị Kim Oanh', 'Nữ', '1993-01-29', 'ASSOCIATED', 'PROSPECTIVE', 30000000, 0, 0, 'Xã Hiệp An, Huyện Đức Trọng'],
            ['Lý Văn Thắng', 'Nam', '1982-05-19', 'OFFICIAL', 'TERMINATED', 30000000, 30000000, 0, 'Thị trấn Liên Nghĩa, Huyện Đức Trọng'],
        ];

        $memberIdMap = [];
        foreach ($names as $idx => $m) {
            $code = 'TV' . str_pad($idx + 1, 3, '0', STR_PAD_LEFT);
            $cccd = '049' . str_pad(100000000 + $idx * 31415, 9, '0', STR_PAD_LEFT);
            $phone = '09' . str_pad(12345678 + $idx * 7891, 8, '0', STR_PAD_LEFT);
            $email = Str::slug($m[0], '') . '@htxtantien.vn';

            $identity = [
                'full_name' => $m[0],
                'gender' => $m[1],
                'dob' => $m[2],
                'citizen_id' => $cccd,
                'phone_number' => $phone,
                'email' => $email,
                'province' => 'Lâm Đồng',
                'district' => 'Lâm Hà',
                'ward' => 'Xã Tân Hà',
                'detail_address' => $m[8],
                'address' => $m[8],
                'bank_account' => '10' . substr($cccd, -8),
                'bank_name' => ($idx % 2 === 0) ? 'Vietcombank - CN Lâm Đồng' : 'Agribank - CN Lâm Hà',
                'account_holder' => strtoupper(Str::slug($m[0], ' ')),
                'cccd_issue_date' => '2021-05-10',
                'cccd_issue_place' => 'Cục Cảnh sát QLHC về trật tự xã hội',
                'committed_capital' => $m[5],
                'contributed_capital' => $m[6],
            ];

            $mId = (string) Str::uuid();
            $existing = DB::table('members')->where('member_code', $code)->first();
            if ($existing) {
                $mId = $existing->id;
                DB::table('members')->where('id', $mId)->update([
                    'cooperative_id' => $coopId,
                    'identity_information' => json_encode($identity),
                    'member_type' => $m[3],
                    'committed_capital' => $m[5],
                    'status' => $m[4],
                    'credit_limit' => $m[7],
                    'admission_date' => $m[4] === 'PROSPECTIVE' ? null : '2024-01-10',
                    'updated_at' => $now,
                ]);
            } else {
                DB::table('members')->insert([
                    'id' => $mId,
                    'cooperative_id' => $coopId,
                    'member_code' => $code,
                    'identity_information' => json_encode($identity),
                    'member_type' => $m[3],
                    'is_foreign_investor' => false,
                    'committed_capital' => $m[5],
                    'status' => $m[4],
                    'credit_limit' => $m[7],
                    'admission_date' => $m[4] === 'PROSPECTIVE' ? null : '2024-01-10',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            if ($m[6] > 0) {
                DB::table('capital_contributions')->insert([
                    'id' => (string) Str::uuid(),
                    'member_id' => $mId,
                    'contribution_type' => 'INITIAL',
                    'amount' => $m[6],
                    'value_description' => 'Góp vốn điều lệ ban đầu gia nhập HTX Nông nghiệp Tân Tiến',
                    'transaction_date' => '2024-01-10',
                    'status' => 'PAID',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            $memberIdMap[$code] = $mId;
        }

        // 3. Production Units (6 Vùng sản xuất lớn chuẩn VietGAP / GlobalGAP)
        $units = [
            ['unit_code' => 'VT-DALAT-01', 'name' => 'Vùng trồng Ớt Chuông Sweet Palermo Hòn Bồ (Phường 12 - Đà Lạt)', 'crop' => 'Ớt chuông Sweet Palermo Đỏ & Vàng', 'area' => 15.0, 'puc' => 'PUC-49-015-9923', 'std' => 'VietGAP', 'lat' => 11.9501, 'lng' => 108.4712],
            ['unit_code' => 'VT-DASAR-02', 'name' => 'Vùng trồng Liên Kết Đạ Sar - Lạc Dương (HTX Tân Tiến)', 'crop' => 'Dâu tây giống Nhật Hana & Cà chua Cherry', 'area' => 12.5, 'puc' => 'PUC-49-015-9924', 'std' => 'VietGAP', 'lat' => 11.9404, 'lng' => 108.4583],
            ['unit_code' => 'VT-TRAMHANH-03', 'name' => 'Vùng Nông Nghiệp CNC Cầu Đất - Trạm Hành (Đà Lạt)', 'crop' => 'Xà lách thủy canh & Trà hoa cúc tiến vua', 'area' => 18.0, 'puc' => 'PUC-49-015-9925', 'std' => 'GlobalGAP', 'lat' => 11.8900, 'lng' => 108.5300],
            ['unit_code' => 'VT-TANUNG-04', 'name' => 'Vùng Canh Tác Rau Củ Hữu Cơ Tà Nung (TP. Đà Lạt)', 'crop' => 'Cải xoăn Kale & Cà chua trái cây Ruby', 'area' => 10.0, 'puc' => 'PUC-49-015-9926', 'std' => 'Organic', 'lat' => 11.9120, 'lng' => 108.3650],
            ['unit_code' => 'VT-LACDUONG-05', 'name' => 'Vùng Chuyên Canh Dâu Tây New Zealand Lạc Dương', 'crop' => 'Dâu tây New Zealand giá thể sơ dừa', 'area' => 8.5, 'puc' => 'PUC-49-015-9927', 'std' => 'VietGAP', 'lat' => 11.9850, 'lng' => 108.4210],
            ['unit_code' => 'VT-DONDUONG-06', 'name' => 'Vùng Liên Kết Rau Củ Quả Công Nghệ Cao Đơn Dương', 'crop' => 'Ớt chuông Sweet Palermo & Cà chua Beef', 'area' => 14.0, 'puc' => 'PUC-49-015-9928', 'std' => 'VietGAP', 'lat' => 11.7950, 'lng' => 108.5420],
        ];

        $unitIds = [];
        foreach ($units as $u) {
            $uId = (string) Str::uuid();
            $unitIds[$u['unit_code']] = $uId;
            DB::table('production_units')->insert([
                'id' => $uId,
                'cooperative_id' => $coopId,
                'unit_code' => $u['unit_code'],
                'name' => $u['name'],
                'crop' => $u['crop'],
                'area' => $u['area'],
                'location' => json_encode([
                    'latitude' => $u['lat'],
                    'longitude' => $u['lng'],
                    'address' => $u['name']
                ]),
                'status' => 'ACTIVE',
                'registration_information' => json_encode([
                    'puc_code' => $u['puc'],
                    'puc_status' => 'ACTIVE',
                    'certified_date' => '2024-01-15',
                    'standard' => $u['std']
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 4. Farm Plots (15 Thửa đất nhà kính công nghệ cao)
        $plotConfigs = [
            ['PLOT-TT-XV001-01', 'VT-DALAT-01', 4.5, 'TV001', 'Đất đỏ bazan', 'Tưới nhỏ giọt Israel bù áp'],
            ['PLOT-TT-XV001-02', 'VT-DALAT-01', 4.0, 'TV001', 'Đất đỏ bazan', 'Tưới nhỏ giọt tự động'],
            ['PLOT-TT-XV002-01', 'VT-DASAR-02', 6.5, 'TV002', 'Giá thể xơ dừa vi sinh', 'Tưới nhỏ giọt Fertigation'],
            ['PLOT-TT-XV003-01', 'VT-DALAT-01', 3.5, 'TV003', 'Màng dinh dưỡng NFT hồi lưu', 'Thủy canh hồi lưu kiểm soát EC/pH'],
            ['PLOT-TT-XV004-01', 'VT-DASAR-02', 5.0, 'TV004', 'Đất thịt nhẹ pha cát', 'Tưới nhỏ giọt Israel'],
            ['PLOT-TT-XV005-01', 'VT-DONDUONG-06', 4.0, 'TV005', 'Đất phù sa cổ', 'Tưới phun mưa & nhỏ giọt'],
            ['PLOT-TT-XV006-01', 'VT-DALAT-01', 3.0, 'TV006', 'Đất đỏ bazan nhà màng', 'Tưới nhỏ giọt bù áp'],
            ['PLOT-TT-XV007-01', 'VT-TRAMHANH-03', 4.5, 'TV007', 'Đất đỏ bazan đồi núi', 'Tưới nhỏ giọt tự động Israel'],
            ['PLOT-TT-XV011-01', 'VT-DALAT-01', 4.0, 'TV011', 'Đất đỏ bazan nhà kính', 'Tưới nhỏ giọt bù áp'],
            ['PLOT-TT-XV012-01', 'VT-DALAT-01', 3.5, 'TV012', 'Đất đỏ bazan', 'Tưới nhỏ giọt Israel'],
            ['PLOT-TT-XV013-01', 'VT-TRAMHANH-03', 5.0, 'TV013', 'Đất đỏ bazan nhà kính', 'Tưới nhỏ giọt bù áp tự động'],
            ['PLOT-TT-XV014-01', 'VT-LACDUONG-05', 4.0, 'TV014', 'Giá thể xơ dừa chuyên dụng', 'Tưới nhỏ giọt tự động theo chu kỳ'],
            ['PLOT-TT-XV015-01', 'VT-TRAMHANH-03', 4.5, 'TV015', 'Đất bazan Cầu Đất', 'Tưới nhỏ giọt bù áp'],
            ['PLOT-TT-XV016-01', 'VT-TANUNG-04', 5.0, 'TV016', 'Đất hữu cơ vi sinh ủ phân trùn', 'Tưới phun sương tự động'],
            ['PLOT-TT-XV017-01', 'VT-DALAT-01', 4.0, 'TV017', 'Đất đỏ bazan Hòn Bồ', 'Tưới nhỏ giọt Israel'],
        ];

        $plotIds = [];
        foreach ($plotConfigs as $p) {
            $pId = (string) Str::uuid();
            $plotIds[$p[0]] = $pId;
            $unitId = $unitIds[$p[1]];
            DB::table('farm_plots')->insert([
                'id' => $pId,
                'production_unit_id' => $unitId,
                'plot_code' => $p[0],
                'area' => $p[2],
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.9500 + (count($plotIds) * 0.0015),
                    'gps_longitude' => 108.4700 + (count($plotIds) * 0.0012),
                    'soil_type' => $p[4],
                    'irrigation' => $p[5],
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Assign to Member
            if (isset($memberIdMap[$p[3]])) {
                DB::table('member_plot_assignments')->insert([
                    'id' => (string) Str::uuid(),
                    'member_id' => $memberIdMap[$p[3]],
                    'plot_id' => $pId,
                    'assignment_type' => 'OWNER',
                    'start_date' => '2025-01-01',
                    'end_date' => null,
                    'status' => 'ACTIVE',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // 5. Crop Seasons (5 Mùa vụ qua các năm)
        $seasonConfigs = [
            ['Vụ Đông Xuân 2025 - 2026 (Ớt chuông Sweet Palermo Đỏ)', 'VT-DALAT-01', 'Ớt chuông Sweet Palermo Đỏ & Vàng', '2025-11-01', '2026-03-31', null, 'IN_PROGRESS', 45000, 350000000],
            ['Vụ Thu Đông 2025 (Đã Hoàn Tất Quyết Toán)', 'VT-DALAT-01', 'Ớt chuông Sweet Palermo & Xà lách thủy canh', '2025-06-01', '2025-10-31', '2025-10-31', 'COMPLETED', 42000, 320000000],
            ['Vụ Hè Thu 2025 (Đã Quyết Toán VietGAP)', 'VT-DASAR-02', 'Dâu tây giống Nhật & Cà chua Cherry', '2025-02-01', '2025-05-31', '2025-05-31', 'COMPLETED', 36000, 270000000],
            ['Vụ Xuân Hè 2026 (Kế Hoạch Mở Rộng OCOP)', 'VT-DASAR-02', 'Dâu tây Hana giống Nhật & Cà chua Cherry', '2026-04-01', '2026-08-31', null, 'PLANNED', 40000, 310000000],
            ['Vụ Thu Đông 2026 (Kế Hoạch Xuất Khẩu)', 'VT-TRAMHANH-03', 'Xà lách thủy canh & Trà hoa cúc sấy', '2026-09-01', '2026-12-31', null, 'PLANNED', 35000, 260000000],
        ];

        $seasonIds = [];
        foreach ($seasonConfigs as $s) {
            $sId = (string) Str::uuid();
            $seasonIds[] = $sId;
            DB::table('crop_seasons')->insert([
                'id' => $sId,
                'production_unit_id' => $unitIds[$s[1]],
                'name' => $s[0],
                'crop' => $s[2],
                'start_date' => $s[3],
                'expected_end_date' => $s[4],
                'actual_end_date' => $s[5],
                'status' => $s[6],
                'plan_information' => json_encode([
                    'target_yield_kg' => $s[7],
                    'budget' => $s[8],
                    'certification_standard' => 'VietGAP',
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $seasonCurrentId = $seasonIds[0];
        $seasonCompletedId = $seasonIds[1];

        // 6. Warehouse
        $warehouseId = (string) Str::uuid();
        DB::table('warehouses')->insert([
            'id' => $warehouseId,
            'cooperative_id' => $coopId,
            'warehouse_code' => 'KHO-TT-01',
            'name' => 'Kho Vật Tư & Nông Sản Trung Tâm Đà Lạt',
            'location' => 'Số 12 Hòn Bồ, Phường 12, TP. Đà Lạt',
            'status' => 'ACTIVE',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 7. Materials (14 Vật tư nông nghiệp cao cấp & bao bì OCOP)
        $matDefs = [
            ['MAT-PHAN-01', 'Phân trùn quế hữu cơ Bio-Grow (25kg)', 'FERTILIZER', 'bao_25kg', 0, '100-150 kg/1000m²', 20],
            ['MAT-PHAN-02', 'Phân bón vi lượng Haifa Cal-Mag Israel (25kg)', 'FERTILIZER', 'bao_25kg', 0, '25kg / 1000L bồn dinh dưỡng', 15],
            ['MAT-PHAN-03', 'Phân bón hữu cơ sinh học rong biển Seasol Australia (Can 5L)', 'FERTILIZER', 'can_5L', 0, '100ml / bình 25L tưới kích rễ', 10],
            ['MAT-PHAN-04', 'Phân dơi hữu cơ nguyên chất tự nhiên (Bao 10kg)', 'FERTILIZER', 'bao_10kg', 0, '50kg / 1000m² bón thúc tạo ngọt', 15],
            ['MAT-BVTV-01', 'Thuốc BVTV Sinh học Neem Oil 1000EC 1L (Azadirachtin)', 'PESTICIDE', 'chai_1L', 3, '20ml / bình 16L trừ bọ trĩ', 10],
            ['MAT-BVTV-02', 'Chế phẩm vi sinh đối kháng Trichoderma Bio-VT (1kg)', 'PESTICIDE', 'goi_1kg', 0, '1kg hòa 400L nước ngừa lở cổ rễ', 12],
            ['MAT-BVTV-03', 'Nấm ba màu sinh học Metarhizium phòng sâu tơ rầy mềm (1kg)', 'PESTICIDE', 'goi_1kg', 0, '50g / bình 16L nước', 10],
            ['MAT-GIONG-01', 'Hạt giống Ớt chuông Sweet Palermo Đỏ F1 (Rijk Zwaan Hà Lan)', 'SEED', 'goi_1000hat', 0, 'Tỷ lệ nảy mầm 98.5%', 5],
            ['MAT-GIONG-02', 'Hạt giống Ớt chuông Sweet Palermo Vàng F1 (Rijk Zwaan Hà Lan)', 'SEED', 'goi_1000hat', 0, 'Tỷ lệ nảy mầm 98.0%', 5],
            ['MAT-GIONG-03', 'Cây giống Dâu tây Hana cấy mô chịu nhiệt F1 (Khay 84 cây)', 'SEED', 'khay_84cay', 0, 'Cây giống sạch virus', 20],
            ['MAT-GIONG-04', 'Hạt giống Xà lách Thủy canh Mỡ Butterhead (Enza Zaden Hà Lan)', 'SEED', 'goi_1000hat', 0, 'Tỷ lệ nảy mầm 99%', 5],
            ['MAT-GIONG-05', 'Hạt giống Cà chua Cherry Socola F1 (Rijk Zwaan Hà Lan)', 'SEED', 'goi_1000hat', 0, 'Tỷ lệ nảy mầm 97.5%', 5],
            ['MAT-BAOBI-01', 'Thùng carton xuất khẩu 5 lớp có màng thở OCOP (Thùng 5kg)', 'OTHER', 'thung', 0, 'Đạt tiêu chuẩn bảo quản xuất khẩu', 100],
            ['MAT-BAOBI-02', 'Túi màng sinh học tự hủy đóng gói xà lách thủy canh (Túi 300g)', 'OTHER', 'cuon_1000tui', 0, 'Thân thiện môi trường', 25],
        ];

        $matIds = [];
        foreach ($matDefs as $m) {
            $mId = (string) Str::uuid();
            $matIds[$m[0]] = $mId;
            DB::table('materials')->insert([
                'id' => $mId,
                'cooperative_id' => $coopId,
                'sku' => $m[0],
                'name' => $m[1],
                'category' => $m[2],
                'unit' => $m[3],
                'safety_information' => json_encode([
                    'phi_days' => $m[4],
                    'dosage' => $m[5],
                ]),
                'reorder_threshold' => $m[6],
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 8. Stock Receipts (4 Phiếu Nhập Kho KCS)
        $rcpts = [
            ['PNK-2025-001', 'Công ty TNHH Phân Bón Sinh Học Bio-Grow', '2025-10-25', 50000000],
            ['PNK-2025-002', 'Công ty CP CNC Israel Việt Nam', '2025-11-02', 62000000],
            ['PNK-2025-003', 'Công ty TNHH Hạt Giống Rijk Zwaan Việt Nam', '2025-11-10', 45000000],
            ['PNK-2025-004', 'Nhà Máy Bao Bì OCOP Lâm Đồng', '2025-12-01', 28000000],
        ];

        $rcptIds = [];
        foreach ($rcpts as $r) {
            $rId = (string) Str::uuid();
            $rcptIds[] = $rId;
            DB::table('stock_receipts')->insert([
                'id' => $rId,
                'cooperative_id' => $coopId,
                'warehouse_id' => $warehouseId,
                'receipt_number' => $r[0],
                'supplier_information' => json_encode(['supplier_name' => $r[1]]),
                'receipt_date' => $r[2],
                'status' => 'APPROVED',
                'total_amount' => $r[3],
                'kcs_inspection' => json_encode(['passed' => true, 'inspector' => 'KCS_TRAN_KHO']),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        DB::table('stock_receipt_lines')->insert([
            ['id' => (string) Str::uuid(), 'stock_receipt_id' => $rcptIds[0], 'material_id' => $matIds['MAT-PHAN-01'], 'quantity' => 100, 'unit_price' => 350000, 'batch_code' => 'BATCH-BG-2025-01', 'expiry_date' => '2027-10-25', 'line_amount' => 35000000, 'created_at' => $now, 'updated_at' => $now],
            ['id' => (string) Str::uuid(), 'stock_receipt_id' => $rcptIds[0], 'material_id' => $matIds['MAT-BVTV-01'], 'quantity' => 60, 'unit_price' => 250000, 'batch_code' => 'BATCH-NO-2025-02', 'expiry_date' => '2027-04-30', 'line_amount' => 15000000, 'created_at' => $now, 'updated_at' => $now],
            ['id' => (string) Str::uuid(), 'stock_receipt_id' => $rcptIds[1], 'material_id' => $matIds['MAT-PHAN-02'], 'quantity' => 80, 'unit_price' => 550000, 'batch_code' => 'BATCH-HC-2025-01', 'expiry_date' => '2028-11-01', 'line_amount' => 44000000, 'created_at' => $now, 'updated_at' => $now],
            ['id' => (string) Str::uuid(), 'stock_receipt_id' => $rcptIds[2], 'material_id' => $matIds['MAT-GIONG-01'], 'quantity' => 25, 'unit_price' => 900000, 'batch_code' => 'BATCH-GIONG-RED-01', 'expiry_date' => '2026-11-01', 'line_amount' => 22500000, 'created_at' => $now, 'updated_at' => $now],
            ['id' => (string) Str::uuid(), 'stock_receipt_id' => $rcptIds[3], 'material_id' => $matIds['MAT-BAOBI-01'], 'quantity' => 2000, 'unit_price' => 14000, 'batch_code' => 'BATCH-BB-2025-01', 'expiry_date' => '2029-01-01', 'line_amount' => 28000000, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 9. Stock Issues (6 Phiếu xuất nợ vật tư trả chậm - Credit Advance)
        $issues = [
            ['PXK-2025-001', '2025-11-05', 'TV001', 'Xuất nợ phân trùn quế đầu vụ cho xã viên Nguyễn Văn A', 7500000, 'MAT-PHAN-01', 15, 500000],
            ['PXK-2025-002', '2025-11-08', 'TV002', 'Xuất nợ phân trùn quế & Neem Oil cho xã viên Trần Thị B', 5500000, 'MAT-PHAN-01', 11, 500000],
            ['PXK-2025-003', '2025-11-12', 'TV004', 'Xuất nợ dinh dưỡng Haifa Cal-Mag cho xã viên liên kết Phạm Thị D', 12000000, 'MAT-PHAN-02', 20, 600000],
            ['PXK-2025-004', '2025-11-15', 'TV005', 'Xuất nợ phân bón và giống cho xã viên Hoàng Văn E', 6000000, 'MAT-PHAN-01', 12, 500000],
            ['PXK-2025-005', '2025-11-20', 'TV007', 'Xuất nợ phân bón và giống dâu tây cho xã viên Vũ Đình Trọng', 15000000, 'MAT-PHAN-02', 25, 600000],
            ['PXK-2025-006', '2025-11-25', 'TV011', 'Xuất nợ phân vi lượng và thùng carton cho xã viên Đỗ Quốc Tuấn', 8500000, 'MAT-PHAN-02', 14, 600000],
        ];

        foreach ($issues as $iss) {
            $issId = (string) Str::uuid();
            DB::table('stock_issues')->insert([
                'id' => $issId,
                'cooperative_id' => $coopId,
                'warehouse_id' => $warehouseId,
                'issue_number' => $iss[0],
                'issue_date' => $iss[1],
                'member_id' => $memberIdMap[$iss[2]],
                'purpose' => $iss[3],
                'is_credit' => true,
                'status' => 'APPROVED',
                'total_amount' => $iss[4],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('stock_issue_lines')->insert([
                'id' => (string) Str::uuid(),
                'stock_issue_id' => $issId,
                'material_id' => $matIds[$iss[5]],
                'quantity' => $iss[6],
                'unit_price' => $iss[7],
                'batch_code' => 'BATCH-DEFAULT-2025',
                'line_amount' => $iss[4],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 10. Receivable Payables (8 Khoản công nợ xã viên thực tế)
        $debts = [
            ['CN-VT-2025-001', 'TV001', 'Nguyễn Văn A', 7500000, 7500000, '2026-03-31', 'Nợ vật tư 15 bao phân Bio-Grow đầu vụ (Phiếu xuất PXK-2025-001)', 'OPEN'],
            ['CN-VT-2025-002', 'TV002', 'Trần Thị B', 5500000, 5500000, '2026-03-31', 'Nợ vật tư 11 bao phân Bio-Grow & Neem Oil (Phiếu xuất PXK-2025-002)', 'OPEN'],
            ['CN-VT-2025-003', 'TV004', 'Phạm Thị D', 12000000, 12000000, '2026-04-15', 'Nợ dinh dưỡng vi lượng Haifa Cal-Mag Israel (Phiếu xuất PXK-2025-003)', 'OPEN'],
            ['CN-VT-2025-004', 'TV005', 'Hoàng Văn E', 6000000, 6000000, '2025-12-31', 'Nợ tiền phân bón vi sinh vụ trước (Quá hạn 6 tháng theo dõi thu hồi)', 'OPEN'],
            ['CN-VT-2025-005', 'TV007', 'Vũ Đình Trọng', 15000000, 15000000, '2026-04-30', 'Nợ phân vi lượng và cây giống dâu tây Hana vụ Đông Xuân', 'OPEN'],
            ['CN-VT-2025-006', 'TV011', 'Đỗ Quốc Tuấn', 8500000, 8500000, '2026-03-31', 'Nợ phân bón lá vi lượng Israel và thùng carton đóng gói', 'OPEN'],
            ['CN-VT-2025-007', 'TV013', 'Trương Văn Hòa', 10000000, 10000000, '2026-04-30', 'Nợ chế phẩm sinh học Trichoderma và phân bón rễ Seasol', 'OPEN'],
            ['CN-VT-2025-008', 'TV017', 'Bùi Văn Khánh', 18000000, 18000000, '2026-05-15', 'Nợ hạt giống Palermo F1 và phân bón Haifa Cal-Mag đầu vụ', 'OPEN'],
        ];

        $debtIdMap = [];
        foreach ($debts as $d) {
            $dId = (string) Str::uuid();
            $debtIdMap[$d[0]] = $dId;
            DB::table('receivable_payables')->insert([
                'id' => $dId,
                'cooperative_id' => $coopId,
                'debt_code' => $d[0],
                'counterparty_type' => 'MEMBER',
                'counterparty_id' => $memberIdMap[$d[1]],
                'counterparty_name' => $d[2],
                'member_id' => $memberIdMap[$d[1]],
                'debt_type' => 'RECEIVABLE',
                'original_amount' => $d[3],
                'outstanding_amount' => $d[4],
                'due_date' => $d[5],
                'description' => $d[6],
                'status' => $d[7],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $adminUser = DB::table('users')->where('username', 'admin')->first()
            ?? DB::table('users')->where('username', 'admin_htx')->first();
        $adminUserId = $adminUser ? $adminUser->id : null;

        // 11. Farming Logs (30 Lượt ghi nhật ký canh tác chuẩn 10 trường Thông tư 02/2024)
        $logActivities = [
            // Plot 1 (Ớt chuông Đỏ - TV001)
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'LAND_PREPARATION', '2025-11-05', 'Cày xới đất tơi xốp sâu 30cm, bón vôi bột khử trùng đáy nhà kính Hòn Bồ và phơi ải 5 ngày', null, null, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'FERTILIZATION', '2025-11-10', 'Bón lót đáy luống nhà kính Hòn Bồ 15 bao phân trùn quế Bio-Grow, phủ màng nông nghiệp giữ ẩm', 'MAT-PHAN-01', 15, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'PLANTING', '2025-11-15', 'Xuống giống 1000 cây giống ớt chuông Sweet Palermo Đỏ F1 (25 ngày tuổi, sạch bệnh)', 'MAT-GIONG-01', 1, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'IRRIGATION', '2025-11-28', 'Châm dinh dưỡng vi lượng Haifa Cal-Mag nồng độ EC 1.8 qua hệ thống tưới nhỏ giọt bù áp tự động Israel', 'MAT-PHAN-02', 5, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'PRUNING', '2025-12-10', 'Tỉa cành phụ dưới cháng chữ V, bấm ngọn định hình 2 thân chính và căng dây dù treo giàn', null, null, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'PEST_CONTROL', '2025-12-18', 'Treo bẫy dính màu vàng Pheromone mật độ 40 tấm/1000m² để theo dõi và phòng trừ bọ trĩ sinh học', null, null, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'PEST_CONTROL', '2025-12-20', 'Phun phòng trừ bọ trĩ và rệp muội bằng chế phẩm Neem Oil sinh học 1000EC (Liều lượng 20ml / 16L nước)', 'MAT-BVTV-01', 2, 3],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'PEST_CONTROL', '2025-12-28', 'Tưới gốc chế phẩm vi sinh đối kháng Trichoderma Bio-VT phòng ngừa nấm Fusarium gây héo rũ gốc', 'MAT-BVTV-02', 2, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'FERTILIZATION', '2026-01-02', 'Bón thúc nuôi quả đợt 1 bằng phân dơi hữu cơ nguyên chất tự nhiên kết hợp tưới kích rễ Seasol', 'MAT-PHAN-04', 3, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'MONITORING', '2026-01-08', 'Kiểm tra độ chín quang trắc trước thu hoạch: Vỏ quả chuyển đỏ đậm bóng, độ Brix khúc xạ kế đạt 8.8%', null, null, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-01', 'HARVEST', '2026-01-10', 'Thu hoạch lứa đầu tiên tuyển chọn KCS Grade A, đóng thùng carton đục lỗ 5kg xuất về kho sơ chế', 'MAT-BAOBI-01', 250, 0],

            // Plot 2 (Ớt chuông Vàng - TV001)
            [$seasonCurrentId, 'PLOT-TT-XV001-02', 'FERTILIZATION', '2025-11-12', 'Bón lót phân trùn quế Bio-Grow và phân dơi hữu cơ cho luống trồng ớt chuông vàng', 'MAT-PHAN-01', 12, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-02', 'PLANTING', '2025-11-16', 'Xuống giống ớt chuông Sweet Palermo Vàng F1 Rijk Zwaan 1000 cây', 'MAT-GIONG-02', 1, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-02', 'IRRIGATION', '2025-12-05', 'Tưới dinh dưỡng nhỏ giọt kết hợp vi lượng Haifa Cal-Mag định kỳ 3 ngày/lần', 'MAT-PHAN-02', 4, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-02', 'PEST_CONTROL', '2025-12-22', 'Phun chế phẩm nấm ba màu Metarhizium phòng sâu tơ và bọ phấn trắng', 'MAT-BVTV-03', 2, 0],
            [$seasonCurrentId, 'PLOT-TT-XV001-02', 'HARVEST', '2026-01-15', 'Thu hoạch lứa đầu tiên ớt chuông Palermo vàng 1.200kg đạt độ ngọt Brix 9.2%', 'MAT-BAOBI-01', 200, 0],

            // Plot 3 (Dâu tây Hana - TV002 Đạ Sar)
            [$seasonCurrentId, 'PLOT-TT-XV002-01', 'LAND_PREPARATION', '2025-11-01', 'Trộn giá thể xơ dừa đã xử lý chát với trùn quế và vi sinh Trichoderma đóng bao màng', 'MAT-BVTV-02', 3, 0],
            [$seasonCurrentId, 'PLOT-TT-XV002-01', 'PLANTING', '2025-11-08', 'Cấy cây giống dâu tây Hana giống Nhật F1 lên giàn chữ A nhà màng', 'MAT-GIONG-03', 20, 0],
            [$seasonCurrentId, 'PLOT-TT-XV002-01', 'IRRIGATION', '2025-11-20', 'Tưới nhỏ giọt dung dịch dinh dưỡng hữu cơ Seasol kích thích bén rễ chùm', 'MAT-PHAN-03', 2, 0],
            [$seasonCurrentId, 'PLOT-TT-XV002-01', 'PRUNING', '2025-12-15', 'Vặt tỉa lá già, ngắt ngó hoa lứa đầu để tập trung nuôi gốc mập mạp', null, null, 0],
            [$seasonCurrentId, 'PLOT-TT-XV002-01', 'HARVEST', '2026-01-20', 'Thu hoạch lứa quả bói đầu vụ dâu tây Hana ngọt đậm, quả đỏ đều 90%', null, null, 0],

            // Plot 4 (Xà lách thủy canh - TV003)
            [$seasonCurrentId, 'PLOT-TT-XV003-01', 'PLANTING', '2025-12-01', 'Gieo hạt giống xà lách mỡ Butterhead lên mút ươm hạt', 'MAT-GIONG-04', 1, 0],
            [$seasonCurrentId, 'PLOT-TT-XV003-01', 'IRRIGATION', '2025-12-10', 'Đưa cây giống lên máng thủy canh hồi lưu NFT, kiểm soát EC 1.4, pH 6.0', null, null, 0],
            [$seasonCurrentId, 'PLOT-TT-XV003-01', 'MONITORING', '2026-01-12', 'Kiểm tra dư lượng nitrat bằng kit test nhanh: 450 ppm (ngưỡng an toàn < 1500 ppm)', null, null, 0],
            [$seasonCurrentId, 'PLOT-TT-XV003-01', 'HARVEST', '2026-01-18', 'Thu hoạch xà lách thủy canh mỡ nguyên rễ, đóng gói túi màng sinh học 300g', 'MAT-BAOBI-02', 2, 0],

            // Nhật ký Vụ Thu Đông 2025 (COMPLETED - Để kiểm chứng Read-Only Freeze Guard)
            [$seasonCompletedId, 'PLOT-TT-XV001-01', 'FERTILIZATION', '2025-08-10', 'Bón thúc phân trùn quế đợt 2 cho vụ Thu Đông', 'MAT-PHAN-01', 10, 0],
            [$seasonCompletedId, 'PLOT-TT-XV001-01', 'PEST_CONTROL', '2025-09-01', 'Phun chế phẩm sinh học Neem Oil phòng trừ sâu xanh', 'MAT-BVTV-01', 2, 3],
            [$seasonCompletedId, 'PLOT-TT-XV001-01', 'HARVEST', '2025-10-15', 'Thu hoạch toàn bộ ớt chuông đợt cuối vụ Thu Đông 2025', 'MAT-BAOBI-01', 300, 0],
            [$seasonCompletedId, 'PLOT-TT-XV001-02', 'HARVEST', '2025-10-20', 'Thu hoạch dứt điểm vụ Thu Đông 2025 bàn giao siêu thị', 'MAT-BAOBI-01', 250, 0],
        ];

        foreach ($logActivities as $log) {
            DB::table('farming_logs')->insert([
                'id' => (string) Str::uuid(),
                'crop_season_id' => $log[0],
                'plot_id' => $plotIds[$log[1]],
                'activity_type' => $log[2],
                'activity_date' => $log[3],
                'description' => $log[4],
                'performed_by' => $adminUserId,
                'attachment_reference' => json_encode([
                    'photo_url' => 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80'
                ]),
                'material_id' => $log[5] ? $matIds[$log[5]] : null,
                'material_batch_number' => $log[5] ? 'BATCH-DEFAULT-2025' : null,
                'quantity_applied' => $log[6],
                'unit' => $log[5] ? 'đơn vị' : null,
                'phi_days' => $log[7],
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 12. Products (6 Sản phẩm OCOP đạt 3 - 4 sao & tiềm năng 5 sao)
        $prodConfigs = [
            ['PRD-PALERMO-RED', 'Ớt chuông Sweet Palermo Đỏ Đà Lạt', 'Rau, củ, quả, hạt tươi', 4, 'VG-49-2024-0089', 'Siêu thị WinMart, Big C, An Nam Gourmet', '≥ 8.5'],
            ['PRD-PALERMO-YEL', 'Ớt chuông Sweet Palermo Vàng Đà Lạt', 'Rau, củ, quả, hạt tươi', 4, 'VG-49-2024-0089', 'Thị trường nội địa cao cấp', '≥ 9.0'],
            ['PRD-PALERMO-ORG', 'Ớt chuông Sweet Palermo Cam Đà Lạt', 'Rau, củ, quả, hạt tươi', 4, 'VG-49-2024-0089', 'Khách sạn 5 sao & Nhà hàng cao cấp', '≥ 9.5'],
            ['PRD-LETTUCE-01', 'Xà Lách Thủy Canh Mỡ Đà Lạt', 'Rau ăn lá thủy canh', 3, 'VG-49-2025-0112', 'Nhà hàng, khách sạn tại Đà Lạt và TP.HCM', 'N/A'],
            ['PRD-STRAWBERRY-01', 'Dâu Tây Hana Giống Nhật Đạ Sar', 'Trái cây tươi cao cấp', 4, 'VG-49-2024-0095', 'Chuỗi cửa hàng trái cây nhập khẩu', '≥ 11.5'],
            ['PRD-CHERRY-01', 'Cà Chua Cherry Socola Đà Lạt', 'Rau, củ, quả, hạt tươi', 3, 'VG-49-2024-0099', 'Hệ thống cửa hàng thực phẩm sạch', '≥ 8.0'],
        ];

        $productIds = [];
        foreach ($prodConfigs as $p) {
            $pId = (string) Str::uuid();
            $productIds[$p[0]] = $pId;
            DB::table('products')->insert([
                'id' => $pId,
                'cooperative_id' => $coopId,
                'product_code' => $p[0],
                'product_name' => $p[1],
                'category' => $p[2],
                'brand' => 'HTX Nông Nghiệp Tân Tiến Đà Lạt',
                'specification' => json_encode([
                    'packaging' => 'Thùng carton 5 lớp có túi đục lỗ thoáng khí',
                    'shelf_life' => '21 ngày ở 8-10°C'
                ]),
                'quality_information' => json_encode([
                    'certification' => 'VietGAP TCVN 11892-1:2017',
                    'cert_no' => $p[4],
                    'cert_date' => '2024-06-15',
                    'brix_level' => $p[6],
                    'ocop_stars' => $p[3],
                    'target_market' => $p[5],
                ]),
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 13. Harvests & Lots (6 Đợt thu hoạch KCS & 6 Lô hàng GS1 tem QR)
        $harvests = [
            ['HARV-2026-001', 'PLOT-TT-XV001-01', '2026-01-10', 1500, 'GRADE_A', 8.8, 1250, 200, 50, 'LOT-TT-2026-001', 'PRD-PALERMO-RED', true],
            ['HARV-2026-002', 'PLOT-TT-XV001-02', '2026-01-15', 1200, 'GRADE_A', 9.2, 1000, 150, 50, 'LOT-TT-2026-002', 'PRD-PALERMO-YEL', false],
            ['HARV-2026-003', 'PLOT-TT-XV003-01', '2026-01-18', 850, 'GRADE_A', null, 800, 50, 0, 'LOT-TT-2026-003', 'PRD-LETTUCE-01', false],
            ['HARV-2026-004', 'PLOT-TT-XV002-01', '2026-01-20', 600, 'GRADE_A', 11.5, 550, 50, 0, 'LOT-TT-2026-004', 'PRD-STRAWBERRY-01', false],
            ['HARV-2026-005', 'PLOT-TT-XV001-01', '2026-01-25', 1800, 'GRADE_A', 8.9, 1600, 150, 50, 'LOT-TT-2026-005', 'PRD-PALERMO-RED', false],
            ['HARV-2026-006', 'PLOT-TT-XV004-01', '2026-01-28', 950, 'GRADE_A', 8.2, 900, 50, 0, 'LOT-TT-2026-006', 'PRD-CHERRY-01', false],
        ];

        foreach ($harvests as $h) {
            $hId = (string) Str::uuid();
            $lId = (string) Str::uuid();

            // 1. Insert harvest first (with lot_id = null)
            DB::table('harvests')->insert([
                'id' => $hId,
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plotIds[$h[1]],
                'harvest_date' => $h[2],
                'quantity' => $h[3],
                'unit' => 'kg',
                'grade' => $h[4],
                'brix_level' => $h[5],
                'uniformity_rate' => 96.0,
                'kcs_status' => 'PASSED',
                'kcs_gate_check' => json_encode(['phi_passed' => true, 'inspector' => 'KCS_LE_TRONG']),
                'kcs_quick_lab' => json_encode(['pesticide_ppm' => 0.001, 'max_allowed_ppm' => 0.05, 'heavy_metals' => 'UNDETECTED']),
                'quality_information' => json_encode([
                    'grade_a_kg' => $h[6],
                    'grade_b_kg' => $h[7],
                    'reject_kg' => $h[8],
                    'is_settled' => $h[11]
                ]),
                'lot_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // 2. Insert lot (referencing harvest_id)
            DB::table('lots')->insert([
                'id' => $lId,
                'lot_code' => $h[9],
                'harvest_id' => $hId,
                'quantity' => $h[6],
                'unit' => 'kg',
                'status' => 'PACKAGED',
                'source_information' => json_encode([
                    'cooperative' => 'HTX Nông Nghiệp Tân Tiến',
                    'plot_code' => $h[1],
                    'puc_code' => 'PUC-49-015-9923',
                    'crop' => 'Nông sản OCOP Tân Tiến',
                    'packaging_date' => $h[2],
                    'qr_url' => 'https://trace.ocop.gov.vn/lot/' . $h[9]
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // 3. Update harvest with lot_id
            DB::table('harvests')->where('id', $hId)->update(['lot_id' => $lId]);

            // 4. Link to Product
            if (isset($productIds[$h[10]])) {
                DB::table('product_lots')->insert([
                    'product_id' => $productIds[$h[10]],
                    'lot_id' => $lId,
                    'quantity' => $h[6],
                    'created_at' => $now,
                ]);
            }
        }

        // 14. OCOP Applications & Final Decisions (3 Hồ sơ OCOP & 3 Quyết định cấp sao)
        $criteriaVersion = DB::table('criteria_versions')->where('status', 'PUBLISHED')->first();
        $cvId = $criteriaVersion ? $criteriaVersion->id : '3ebdcd43-f84f-4309-8642-1f1e563deed7';

        $apps = [
            ['OCOP-2026-DALAT-001', 'PRD-PALERMO-RED', 'QĐ-UBND-2026-089', '2026-01-15', 'FOUR_STAR', 'UBND Tỉnh Lâm Đồng'],
            ['OCOP-2025-LACDUONG-002', 'PRD-LETTUCE-01', 'QĐ-UBND-2025-334', '2025-09-01', 'THREE_STAR', 'UBND Huyện Lạc Dương'],
            ['OCOP-2026-DASAR-003', 'PRD-STRAWBERRY-01', 'QĐ-UBND-2026-112', '2026-02-10', 'FOUR_STAR', 'UBND Tỉnh Lâm Đồng'],
        ];

        foreach ($apps as $a) {
            $aId = (string) Str::uuid();
            DB::table('ocop_applications')->insert([
                'id' => $aId,
                'cooperative_id' => $coopId,
                'product_id' => $productIds[$a[1]],
                'criteria_version_id' => $cvId,
                'application_number' => $a[0],
                'application_type' => 'NEW_EVALUATION',
                'status' => 'SUBMITTED',
                'submitted_at' => '2026-01-12 09:00:00',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('final_decisions')->insert([
                'id' => (string) Str::uuid(),
                'application_id' => $aId,
                'decision_number' => $a[2],
                'decision_date' => $a[3],
                'final_classification' => $a[4],
                'effective_date' => $a[3],
                'authority_reference' => json_encode(['issuer' => $a[5]]),
                'status' => 'ISSUED',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 15. Cash Transactions (15 Giao dịch Sổ Quỹ Thu - Chi thực tế qua ngân hàng & tiền mặt)
        $txSettleId = (string) Str::uuid();
        $transactions = [
            ['PT-2025-001', 'TXN-2025-001', 'INCOME', 50000000, '2025-10-01', 'GOP_VON', 'Thu tiền mặt góp vốn điều lệ đợt 1 từ xã viên Nguyễn Văn A (TV001)', 'Nguyễn Văn A', 'TV001'],
            ['PT-2025-002', 'TXN-2025-002', 'INCOME', 40000000, '2025-10-05', 'GOP_VON', 'Thu chuyển khoản Agribank góp vốn điều lệ từ xã viên Trần Thị B (TV002)', 'Trần Thị B', 'TV002'],
            ['PT-2025-003', 'TXN-2025-003', 'INCOME', 25000000, '2025-10-10', 'GOP_VON', 'Thu tiền góp vốn thành viên liên kết từ xã viên Phạm Thị D (TV004)', 'Phạm Thị D', 'TV004'],
            ['PT-2025-004', 'TXN-2025-004', 'INCOME', 60000000, '2025-10-15', 'GOP_VON', 'Thu nộp vốn điều lệ thành viên chính thức từ xã viên Vũ Đình Trọng (TV007)', 'Vũ Đình Trọng', 'TV007'],
            ['PC-2025-001', 'TXN-2025-005', 'EXPENSE', 25000000, '2025-10-25', 'MUA_VAT_TU', 'Thanh toán tạm ứng 50% tiền phân bón Bio-Grow cho nhà cung cấp', 'Công ty TNHH Bio-Grow', null],
            ['PC-2025-002', 'TXN-2025-006', 'EXPENSE', 31000000, '2025-11-05', 'MUA_VAT_TU', 'Thanh toán tiền phân bón Haifa Cal-Mag Israel nhập kho PNK-2025-002', 'Công ty CP CNC Israel Việt Nam', null],
            ['PC-2025-003', 'TXN-2025-007', 'EXPENSE', 22500000, '2025-11-12', 'MUA_VAT_TU', 'Thanh toán tiền hạt giống ớt chuông Sweet Palermo F1 Rijk Zwaan', 'Công ty TNHH Rijk Zwaan', null],
            ['PT-2026-001', 'TXN-2026-001', 'INCOME', 43750000, '2026-01-12', 'BAN_NONG_SAN', 'Thu tiền bán 1.250kg Ớt chuông Sweet Palermo Đỏ Grade A cho Hệ thống WinMart', 'Tập đoàn WinCommerce', null],
            ['PT-2026-002', 'TXN-2026-002', 'INCOME', 35000000, '2026-01-16', 'BAN_NONG_SAN', 'Thu tiền bán 1.000kg Ớt chuông Sweet Palermo Vàng Grade A cho Siêu thị Big C', 'Tập đoàn Central Retail', null],
            ['PT-2026-003', 'TXN-2026-003', 'INCOME', 24000000, '2026-01-19', 'BAN_NONG_SAN', 'Thu tiền bán 800kg Xà lách thủy canh cho Chuỗi An Nam Gourmet', 'An Nam Gourmet Market', null],
            ['PT-2026-004', 'TXN-2026-004', 'INCOME', 55000000, '2026-01-22', 'BAN_NONG_SAN', 'Thu tiền bán 550kg Dâu tây Hana Đạ Sar cho Chuỗi Trái cây Nhập khẩu', 'Chuỗi Trái Cây Sạch Mia Fruit', null],
            ['PC-2026-001', 'TXN-2026-005', 'EXPENSE', 35156250, '2026-01-15', 'QUYET_TOAN_MUA_VU', 'Thanh toán tiền thu mua ớt chuông đợt 1 cho xã viên Nguyễn Văn A (sau khi cấn trừ 7.500.000đ nợ vật tư và 2.5% phí dịch vụ HTX)', 'Nguyễn Văn A', 'TV001'],
            ['PT-2026-005', 'TXN-2026-006', 'INCOME', 1093750, '2026-01-15', 'PHI_DICH_VU_HTX', 'Thu phí dịch vụ hỗ trợ tiêu thụ 2.5% từ đợt quyết toán thu mua ớt chuông (43.750.000đ * 2.5%)', 'Quỹ điều hành HTX Tân Tiến', null],
            ['PC-2026-002', 'TXN-2026-007', 'EXPENSE', 4500000, '2026-01-18', 'CHI_PHI_VAN_HANH', 'Chi bảo dưỡng định kỳ hệ thống tưới nhỏ giọt bù áp Israel nhà kính Hòn Bồ', 'Công ty Dịch vụ Kỹ thuật Nông nghiệp Xanh', null],
            ['PC-2026-003', 'TXN-2026-008', 'EXPENSE', 8200000, '2026-01-25', 'CHI_PHI_VAN_HANH', 'Chi phí xét nghiệm mẫu đất, nước và kiểm nghiệm dư lượng KCS tại Trung tâm Kiểm nghiệm Đà Lạt', 'Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng', null],
        ];

        foreach ($transactions as $idx => $t) {
            $tId = ($t[0] === 'PC-2026-001') ? $txSettleId : (string) Str::uuid();
            DB::table('cash_transactions')->insert([
                'id' => $tId,
                'cooperative_id' => $coopId,
                'voucher_number' => $t[0],
                'transaction_number' => $t[1],
                'transaction_type' => $t[2],
                'amount' => $t[3],
                'transaction_date' => $t[4],
                'category' => $t[5],
                'description' => $t[6],
                'payer_payee' => $t[7],
                'member_id' => $t[8] ? $memberIdMap[$t[8]] : null,
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 16. Debt Settlement Record (Lịch sử quyết toán cấn trừ nợ mùa vụ)
        DB::table('debt_settlements')->insert([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopId,
            'debt_id' => $debtIdMap['CN-VT-2025-001'],
            'settlement_type' => 'HARVEST_OFFSET',
            'payment_method' => 'HARVEST_OFFSET',
            'amount' => 7500000,
            'settlement_date' => '2026-01-15',
            'cash_transaction_id' => $txSettleId,
            'reference_number' => 'SETTLE-2026-001',
            'note' => 'Cấn trừ nợ vật tư 15 bao phân Bio-Grow đầu vụ (7.500.000đ) từ tiền thu mua 1.250kg ớt chuông đợt 1',
            'reference' => json_encode([
                'season_id' => $seasonCurrentId,
                'season_name' => 'Vụ Đông Xuân 2025 - 2026',
                'member_id' => $memberIdMap['TV001'],
                'member_name' => 'Nguyễn Văn A',
                'produce_value' => 43750000,
                'service_fee' => 1093750,
                'debt_offset' => 7500000,
                'net_payout' => 35156250
            ]),
            'status' => 'POSTED',
            'created_at' => $now,
        ]);
    }
}
