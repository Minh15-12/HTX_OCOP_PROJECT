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

        // 1. Get or Ensure Cooperative (HTX Nông Nghiệp Tân Tiến)
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
                'charter_capital' => 500000000,
                'established_date' => '2018-04-15',
            ]),
            'contact_information' => json_encode([
                'phone_number' => '02633829988',
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

        // Clean tear-down in reverse foreign-key order for idempotency
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
        DB::table('production_units')->where('cooperative_id', $coopId)->delete();
        DB::table('warehouses')->where('cooperative_id', $coopId)->delete();

        // 2. Members (10 Xã viên đa dạng phân loại và FSM)
        $membersData = [
            [
                'code' => 'TV001',
                'name' => 'Nguyễn Văn A',
                'gender' => 'Nam',
                'dob' => '1985-04-12',
                'cccd' => '049085001234',
                'phone' => '0987654321',
                'email' => 'nguyenvana@htxtantien.vn',
                'address' => 'Thôn 2, Xã Mê Linh, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                'type' => 'OFFICIAL',
                'status' => 'ACTIVE',
                'committed' => 50000000,
                'contributed' => 50000000,
                'credit_limit' => 25000000,
                'admission_date' => '2024-01-10',
            ],
            [
                'code' => 'TV002',
                'name' => 'Trần Thị B',
                'gender' => 'Nữ',
                'dob' => '1990-08-20',
                'cccd' => '049190005678',
                'phone' => '0976543210',
                'email' => 'tranthib@htxtantien.vn',
                'address' => 'Thôn 1, Xã Tân Hà, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                'type' => 'OFFICIAL',
                'status' => 'ACTIVE',
                'committed' => 50000000,
                'contributed' => 40000000,
                'credit_limit' => 20000000,
                'admission_date' => '2024-02-15',
            ],
            [
                'code' => 'TV003',
                'name' => 'Lê Văn C',
                'gender' => 'Nam',
                'dob' => '1982-11-05',
                'cccd' => '049082009876',
                'phone' => '0912345678',
                'email' => 'levanc@htxtantien.vn',
                'address' => 'Thôn 4, Xã Mê Linh, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                'type' => 'OFFICIAL',
                'status' => 'ACTIVE',
                'committed' => 100000000,
                'contributed' => 100000000,
                'credit_limit' => 35000000,
                'admission_date' => '2024-03-01',
            ],
            [
                'code' => 'TV004',
                'name' => 'Phạm Thị D',
                'gender' => 'Nữ',
                'dob' => '1992-06-18',
                'cccd' => '049192003456',
                'phone' => '0934567890',
                'email' => 'phamthid@htxtantien.vn',
                'address' => 'Thôn 3, Xã Gia Lâm, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                'type' => 'ASSOCIATED',
                'status' => 'ACTIVE',
                'committed' => 25000000,
                'contributed' => 25000000,
                'credit_limit' => 15000000,
                'admission_date' => '2024-04-10',
            ],
            [
                'code' => 'TV005',
                'name' => 'Hoàng Văn E',
                'gender' => 'Nam',
                'dob' => '1988-09-25',
                'cccd' => '049088007890',
                'phone' => '0945678901',
                'email' => 'hoangvane@htxtantien.vn',
                'address' => 'Thôn 5, Xã Tân Văn, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                'type' => 'OFFICIAL',
                'status' => 'ACTIVE',
                'committed' => 30000000,
                'contributed' => 15000000,
                'credit_limit' => 15000000,
                'admission_date' => '2024-05-02',
            ],
            [
                'code' => 'TV006',
                'name' => 'Đặng Thị Mai',
                'gender' => 'Nữ',
                'dob' => '1995-03-14',
                'cccd' => '049195006789',
                'phone' => '0956789012',
                'email' => 'dangthimai@htxtantien.vn',
                'address' => 'Khu Hòn Bồ, Phường 12, TP. Đà Lạt, Tỉnh Lâm Đồng',
                'type' => 'ASSOCIATED',
                'status' => 'ACTIVE',
                'committed' => 20000000,
                'contributed' => 20000000,
                'credit_limit' => 10000000,
                'admission_date' => '2024-06-15',
            ],
            [
                'code' => 'TV007',
                'name' => 'Vũ Đình Trọng',
                'gender' => 'Nam',
                'dob' => '1979-12-08',
                'cccd' => '049079001122',
                'phone' => '0967890123',
                'email' => 'vudinhtrong@htxtantien.vn',
                'address' => 'Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng',
                'type' => 'OFFICIAL',
                'status' => 'ACTIVE',
                'committed' => 60000000,
                'contributed' => 60000000,
                'credit_limit' => 30000000,
                'admission_date' => '2024-07-20',
            ],
            [
                'code' => 'TV008',
                'name' => 'Bùi Thanh Thảo',
                'gender' => 'Nữ',
                'dob' => '1993-05-30',
                'cccd' => '049193004455',
                'phone' => '0978901234',
                'email' => 'buithanhthao@htxtantien.vn',
                'address' => 'Thôn 1, Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng',
                'type' => 'ASSOCIATED',
                'status' => 'PROSPECTIVE',
                'committed' => 30000000,
                'contributed' => 0,
                'credit_limit' => 0,
                'admission_date' => null,
            ],
            [
                'code' => 'TV009',
                'name' => 'Ngô Quang Khải',
                'gender' => 'Nam',
                'dob' => '1986-10-18',
                'cccd' => '049086008899',
                'phone' => '0989012345',
                'email' => 'ngoquangkhai@htxtantien.vn',
                'address' => 'Xã Trạm Hành, TP. Đà Lạt, Tỉnh Lâm Đồng',
                'type' => 'OFFICIAL',
                'status' => 'PROSPECTIVE',
                'committed' => 20000000,
                'contributed' => 0,
                'credit_limit' => 0,
                'admission_date' => null,
            ],
            [
                'code' => 'TV010',
                'name' => 'Lâm Văn Hùng',
                'gender' => 'Nam',
                'dob' => '1975-02-28',
                'cccd' => '049075003344',
                'phone' => '0990123456',
                'email' => 'lamvanhung@htxtantien.vn',
                'address' => 'Thôn 3, Xã Tân Hà, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                'type' => 'OFFICIAL',
                'status' => 'SUSPENDED',
                'committed' => 20000000,
                'contributed' => 20000000,
                'credit_limit' => 0,
                'admission_date' => '2024-01-15',
            ],
        ];

        $memberIdMap = [];
        foreach ($membersData as $m) {
            $existing = DB::table('members')->where('member_code', $m['code'])->first();
            $identity = [
                'full_name' => $m['name'],
                'gender' => $m['gender'],
                'dob' => $m['dob'],
                'citizen_id' => $m['cccd'],
                'phone_number' => $m['phone'],
                'email' => $m['email'],
                'province' => 'Lâm Đồng',
                'district' => 'Lâm Hà',
                'ward' => 'Xã Tân Hà',
                'detail_address' => $m['address'],
                'address' => $m['address'],
                'bank_account' => '10' . substr($m['cccd'], -8),
                'bank_name' => 'Vietcombank - CN Lâm Đồng',
                'account_holder' => strtoupper(Str::slug($m['name'], ' ')),
                'cccd_issue_date' => '2021-05-10',
                'cccd_issue_place' => 'Cục Cảnh sát QLHC về trật tự xã hội'
            ];

            if ($existing) {
                DB::table('members')->where('id', $existing->id)->update([
                    'cooperative_id' => $coopId,
                    'identity_information' => json_encode($identity),
                    'member_type' => $m['type'],
                    'committed_capital' => $m['committed'],
                    'status' => $m['status'],
                    'credit_limit' => $m['credit_limit'],
                    'admission_date' => $m['admission_date'],
                    'updated_at' => $now,
                ]);
                $memberIdMap[$m['code']] = $existing->id;
            } else {
                $mId = (string) Str::uuid();
                DB::table('members')->insert([
                    'id' => $mId,
                    'cooperative_id' => $coopId,
                    'member_code' => $m['code'],
                    'identity_information' => json_encode($identity),
                    'member_type' => $m['type'],
                    'is_foreign_investor' => false,
                    'committed_capital' => $m['committed'],
                    'status' => $m['status'],
                    'credit_limit' => $m['credit_limit'],
                    'admission_date' => $m['admission_date'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $memberIdMap[$m['code']] = $mId;
            }
        }

        // 3. Production Units (3 Vùng sản xuất lớn chuẩn VietGAP / GlobalGAP)
        $unit1Id = (string) Str::uuid();
        $unit2Id = (string) Str::uuid();
        $unit3Id = (string) Str::uuid();

        DB::table('production_units')->insert([
            [
                'id' => $unit1Id,
                'cooperative_id' => $coopId,
                'unit_code' => 'VT-DALAT-01',
                'name' => 'Vùng trồng Ớt Chuông Sweet Palermo Hòn Bồ (Phường 12 - Đà Lạt)',
                'crop' => 'Ớt chuông Sweet Palermo Đỏ & Vàng',
                'area' => 15.0,
                'location' => json_encode([
                    'latitude' => 11.9501,
                    'longitude' => 108.4712,
                    'address' => 'Khu Hòn Bồ, Phường 12, TP. Đà Lạt, Tỉnh Lâm Đồng'
                ]),
                'status' => 'ACTIVE',
                'registration_information' => json_encode([
                    'puc_code' => 'PUC-49-015-9923',
                    'puc_status' => 'ACTIVE',
                    'certified_date' => '2024-01-15',
                    'standard' => 'VietGAP'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $unit2Id,
                'cooperative_id' => $coopId,
                'unit_code' => 'VT-DASAR-02',
                'name' => 'Vùng trồng Liên Kết Đạ Sar - Lạc Dương (HTX Tân Tiến)',
                'crop' => 'Dâu tây giống Nhật Hana & Cà chua Cherry',
                'area' => 12.5,
                'location' => json_encode([
                    'latitude' => 11.9404,
                    'longitude' => 108.4583,
                    'address' => 'Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng'
                ]),
                'status' => 'ACTIVE',
                'registration_information' => json_encode([
                    'puc_code' => 'PUC-49-015-9924',
                    'puc_status' => 'ACTIVE',
                    'certified_date' => '2024-03-20',
                    'standard' => 'VietGAP'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $unit3Id,
                'cooperative_id' => $coopId,
                'unit_code' => 'VT-TRAMHANH-03',
                'name' => 'Vùng Nông Nghiệp Công Nghệ Cao Cầu Đất - Trạm Hành (Đà Lạt)',
                'crop' => 'Xà lách thủy canh & Ớt chuông Sweet Palermo',
                'area' => 18.0,
                'location' => json_encode([
                    'latitude' => 11.8900,
                    'longitude' => 108.5300,
                    'address' => 'Xã Trạm Hành, TP. Đà Lạt, Tỉnh Lâm Đồng'
                ]),
                'status' => 'ACTIVE',
                'registration_information' => json_encode([
                    'puc_code' => 'PUC-49-015-9925',
                    'puc_status' => 'ACTIVE',
                    'certified_date' => '2024-05-10',
                    'standard' => 'GlobalGAP'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 4. Farm Plots (6 Thửa đất canh tác nhà kính)
        $plot1Id = (string) Str::uuid();
        $plot2Id = (string) Str::uuid();
        $plot3Id = (string) Str::uuid();
        $plot4Id = (string) Str::uuid();
        $plot5Id = (string) Str::uuid();
        $plot6Id = (string) Str::uuid();

        DB::table('farm_plots')->insert([
            [
                'id' => $plot1Id,
                'production_unit_id' => $unit1Id,
                'plot_code' => 'PLOT-TT-XV001-01',
                'area' => 4.5,
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.9501,
                    'gps_longitude' => 108.4712,
                    'puc_code' => 'PUC-49-015-9923',
                    'soil_type' => 'Đất đỏ bazan màu mỡ',
                    'irrigation' => 'Nhỏ giọt Israel bù áp tự động'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $plot2Id,
                'production_unit_id' => $unit1Id,
                'plot_code' => 'PLOT-TT-XV001-02',
                'area' => 4.0,
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.9510,
                    'gps_longitude' => 108.4720,
                    'puc_code' => 'PUC-49-015-9923',
                    'soil_type' => 'Đất đỏ bazan',
                    'irrigation' => 'Tưới nhỏ giọt'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $plot3Id,
                'production_unit_id' => $unit2Id,
                'plot_code' => 'PLOT-TT-XV002-01',
                'area' => 6.5,
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.9404,
                    'gps_longitude' => 108.4583,
                    'puc_code' => 'PUC-49-015-9924',
                    'soil_type' => 'Đất giá thể xơ dừa vi sinh',
                    'irrigation' => 'Tưới phun sương & nhỏ giọt tự động'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $plot4Id,
                'production_unit_id' => $unit1Id,
                'plot_code' => 'PLOT-TT-XV003-01',
                'area' => 3.5,
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.9520,
                    'gps_longitude' => 108.4730,
                    'puc_code' => 'PUC-49-015-9923',
                    'soil_type' => 'Màng dinh dưỡng NFT hồi lưu',
                    'irrigation' => 'Thủy canh hồi lưu kiểm soát EC/pH'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $plot5Id,
                'production_unit_id' => $unit2Id,
                'plot_code' => 'PLOT-TT-XV004-01',
                'area' => 5.0,
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.9420,
                    'gps_longitude' => 108.4600,
                    'puc_code' => 'PUC-49-015-9924',
                    'soil_type' => 'Đất thịt nhẹ pha cát',
                    'irrigation' => 'Tưới nhỏ giọt Fertigation'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $plot6Id,
                'production_unit_id' => $unit3Id,
                'plot_code' => 'PLOT-TT-XV007-01',
                'area' => 4.0,
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.8920,
                    'gps_longitude' => 108.5320,
                    'puc_code' => 'PUC-49-015-9925',
                    'soil_type' => 'Đất đỏ bazan nhà kính',
                    'irrigation' => 'Tưới nhỏ giọt bù áp Israel'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 5. Member Plot Assignments
        DB::table('member_plot_assignments')->insert([
            [
                'id' => (string) Str::uuid(),
                'member_id' => $memberIdMap['TV001'],
                'plot_id' => $plot1Id,
                'assignment_type' => 'OWNER',
                'start_date' => '2025-01-01',
                'end_date' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'member_id' => $memberIdMap['TV001'],
                'plot_id' => $plot2Id,
                'assignment_type' => 'CO_FARMER',
                'start_date' => '2025-01-01',
                'end_date' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'member_id' => $memberIdMap['TV002'],
                'plot_id' => $plot3Id,
                'assignment_type' => 'OWNER',
                'start_date' => '2025-01-01',
                'end_date' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'member_id' => $memberIdMap['TV003'],
                'plot_id' => $plot4Id,
                'assignment_type' => 'OWNER',
                'start_date' => '2025-01-01',
                'end_date' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'member_id' => $memberIdMap['TV004'],
                'plot_id' => $plot5Id,
                'assignment_type' => 'OWNER',
                'start_date' => '2025-01-01',
                'end_date' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'member_id' => $memberIdMap['TV007'],
                'plot_id' => $plot6Id,
                'assignment_type' => 'OWNER',
                'start_date' => '2025-01-01',
                'end_date' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 6. Crop Seasons (3 Mùa vụ: Đang diễn ra, Đã hoàn tất đóng băng, và Kế hoạch)
        $seasonCurrentId = (string) Str::uuid();
        $seasonCompletedId = (string) Str::uuid();
        $seasonPlannedId = (string) Str::uuid();

        DB::table('crop_seasons')->insert([
            [
                'id' => $seasonCurrentId,
                'production_unit_id' => $unit1Id,
                'name' => 'Vụ Đông Xuân 2025 - 2026',
                'crop' => 'Ớt chuông Sweet Palermo Đỏ & Vàng',
                'start_date' => '2025-11-01',
                'expected_end_date' => '2026-03-31',
                'actual_end_date' => null,
                'status' => 'IN_PROGRESS',
                'plan_information' => json_encode([
                    'target_yield_kg' => 45000,
                    'budget' => 350000000,
                    'certification_standard' => 'VietGAP',
                    'puc_code' => 'PUC-49-015-9923'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $seasonCompletedId,
                'production_unit_id' => $unit1Id,
                'name' => 'Vụ Thu Đông 2025 (Đã Hoàn Tất)',
                'crop' => 'Ớt chuông Sweet Palermo & Xà lách thủy canh',
                'start_date' => '2025-06-01',
                'expected_end_date' => '2025-10-31',
                'actual_end_date' => '2025-10-31',
                'status' => 'COMPLETED',
                'plan_information' => json_encode([
                    'target_yield_kg' => 42000,
                    'actual_yield_kg' => 43250,
                    'budget' => 320000000,
                    'certification_standard' => 'VietGAP',
                    'puc_code' => 'PUC-49-015-9923'
                ]),
                'created_at' => $now->subMonths(5),
                'updated_at' => $now->subMonths(1),
            ],
            [
                'id' => $seasonPlannedId,
                'production_unit_id' => $unit2Id,
                'name' => 'Vụ Xuân Hè 2026 (Kế Hoạch)',
                'crop' => 'Dâu tây Hana giống Nhật & Cà chua Cherry',
                'start_date' => '2026-04-01',
                'expected_end_date' => '2026-08-31',
                'actual_end_date' => null,
                'status' => 'PLANNED',
                'plan_information' => json_encode([
                    'target_yield_kg' => 38000,
                    'budget' => 280000000,
                    'certification_standard' => 'VietGAP',
                    'puc_code' => 'PUC-49-015-9924'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 7. Warehouse
        $warehouseId = (string) Str::uuid();
        DB::table('warehouses')->insert([
            'id' => $warehouseId,
            'cooperative_id' => $coopId,
            'warehouse_code' => 'KHO-TT-01',
            'name' => 'Kho Vật Tư & Nông Sản Trung Tâm Đà Lạt',
            'location' => 'Số 12 Hòn Bồ, Phường 12, TP. Đà Lạt',
            'manager_id' => null,
            'status' => 'ACTIVE',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 8. Materials (8 Vật tư nông nghiệp cao cấp phục vụ OCOP)
        $matBioGrowId = (string) Str::uuid();
        $matHaifaCalMagId = (string) Str::uuid();
        $matSeasolId = (string) Str::uuid();
        $matNeemOilId = (string) Str::uuid();
        $matTrichoId = (string) Str::uuid();
        $matGiongRedId = (string) Str::uuid();
        $matGiongYelId = (string) Str::uuid();
        $matBaoBiId = (string) Str::uuid();

        DB::table('materials')->insert([
            [
                'id' => $matBioGrowId,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-PHAN-01',
                'name' => 'Phân trùn quế hữu cơ Bio-Grow (25kg)',
                'category' => 'FERTILIZER',
                'unit' => 'bao_25kg',
                'safety_information' => json_encode([
                    'phi_days' => 0,
                    'dosage' => '100-150 kg/1000m²',
                    'manufacturer' => 'Công ty Bio-Grow Lâm Đồng'
                ]),
                'reorder_threshold' => 20,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $matHaifaCalMagId,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-PHAN-02',
                'name' => 'Phân bón vi lượng Haifa Cal-Mag Israel (25kg)',
                'category' => 'FERTILIZER',
                'unit' => 'bao_25kg',
                'safety_information' => json_encode([
                    'phi_days' => 0,
                    'dosage' => '25kg / 1000L bồn châm dinh dưỡng EC 1.8',
                    'manufacturer' => 'Haifa Chemicals Ltd (Israel)'
                ]),
                'reorder_threshold' => 15,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $matSeasolId,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-PHAN-03',
                'name' => 'Phân bón hữu cơ sinh học rong biển Seasol Australia (Can 5L)',
                'category' => 'FERTILIZER',
                'unit' => 'can_5L',
                'safety_information' => json_encode([
                    'phi_days' => 0,
                    'dosage' => '100ml / bình 25L tưới gốc kích rễ',
                    'manufacturer' => 'Seasol International (Australia)'
                ]),
                'reorder_threshold' => 10,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $matNeemOilId,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-BVTV-01',
                'name' => 'Thuốc BVTV Sinh học Neem Oil 1000EC 1L (Azadirachtin)',
                'category' => 'PESTICIDE',
                'unit' => 'chai_1L',
                'safety_information' => json_encode([
                    'phi_days' => 3,
                    'active_ingredient' => 'Azadirachtin 0.3%',
                    'dosage' => '20ml / bình 16L nước phòng ngừa bọ trĩ'
                ]),
                'reorder_threshold' => 10,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $matTrichoId,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-BVTV-02',
                'name' => 'Chế phẩm vi sinh đối kháng Trichoderma Bio-VT (1kg)',
                'category' => 'PESTICIDE',
                'unit' => 'goi_1kg',
                'safety_information' => json_encode([
                    'phi_days' => 0,
                    'active_ingredient' => 'Trichoderma harzianum 10^9 CFU/g',
                    'dosage' => '1kg hòa 400L nước tưới gốc phòng lở cổ rễ'
                ]),
                'reorder_threshold' => 12,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $matGiongRedId,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-GIONG-01',
                'name' => 'Hạt giống Ớt chuông Sweet Palermo Đỏ F1 (Rijk Zwaan Hà Lan)',
                'category' => 'SEED',
                'unit' => 'goi_1000hat',
                'safety_information' => json_encode([
                    'germination_rate' => '98.5%',
                    'origin' => 'Rijk Zwaan (Hà Lan)'
                ]),
                'reorder_threshold' => 5,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $matGiongYelId,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-GIONG-02',
                'name' => 'Hạt giống Ớt chuông Sweet Palermo Vàng F1 (Rijk Zwaan Hà Lan)',
                'category' => 'SEED',
                'unit' => 'goi_1000hat',
                'safety_information' => json_encode([
                    'germination_rate' => '98.0%',
                    'origin' => 'Rijk Zwaan (Hà Lan)'
                ]),
                'reorder_threshold' => 5,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $matBaoBiId,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-BAOBI-01',
                'name' => 'Thùng carton xuất khẩu 5 lớp có màng thở OCOP (Thùng 5kg)',
                'category' => 'OTHER',
                'unit' => 'thung',
                'safety_information' => json_encode([
                    'standard' => 'Tiêu chuẩn bảo quản rau quả xuất khẩu'
                ]),
                'reorder_threshold' => 100,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 9. Stock Receipts (2 Phiếu Nhập Kho KCS)
        $rcpt1Id = (string) Str::uuid();
        $rcpt2Id = (string) Str::uuid();

        DB::table('stock_receipts')->insert([
            [
                'id' => $rcpt1Id,
                'cooperative_id' => $coopId,
                'warehouse_id' => $warehouseId,
                'receipt_number' => 'PNK-2025-001',
                'supplier_information' => json_encode([
                    'supplier_name' => 'Công ty TNHH Phân Bón Sinh Học Bio-Grow',
                    'phone' => '02633888999',
                    'address' => 'Đức Trọng, Lâm Đồng'
                ]),
                'receipt_date' => '2025-10-25',
                'status' => 'APPROVED',
                'total_amount' => 50000000,
                'evidence_reference' => json_encode([
                    'coa_url' => 'https://example.com/coa/bio-grow.pdf',
                    'invoice_no' => 'HD-00912'
                ]),
                'kcs_inspection' => json_encode([
                    'passed' => true,
                    'inspector' => 'KCS_TRAN_KHO',
                    'checked_date' => '2025-10-25'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $rcpt2Id,
                'cooperative_id' => $coopId,
                'warehouse_id' => $warehouseId,
                'receipt_number' => 'PNK-2025-002',
                'supplier_information' => json_encode([
                    'supplier_name' => 'Công ty CP Nông Nghiệp Công Nghệ Cao Israel Việt Nam',
                    'phone' => '02839998888',
                    'address' => 'Khu CNC TP.HCM'
                ]),
                'receipt_date' => '2025-11-02',
                'status' => 'APPROVED',
                'total_amount' => 62000000,
                'evidence_reference' => json_encode([
                    'coa_url' => 'https://example.com/coa/haifa-israel.pdf',
                    'invoice_no' => 'HD-01045'
                ]),
                'kcs_inspection' => json_encode([
                    'passed' => true,
                    'inspector' => 'KCS_TRAN_KHO',
                    'checked_date' => '2025-11-02'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('stock_receipt_lines')->insert([
            [
                'id' => (string) Str::uuid(),
                'stock_receipt_id' => $rcpt1Id,
                'material_id' => $matBioGrowId,
                'quantity' => 100,
                'unit_price' => 350000,
                'batch_code' => 'BATCH-BG-2025-01',
                'expiry_date' => '2027-10-25',
                'line_amount' => 35000000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'stock_receipt_id' => $rcpt1Id,
                'material_id' => $matNeemOilId,
                'quantity' => 60,
                'unit_price' => 250000,
                'batch_code' => 'BATCH-NO-2025-02',
                'expiry_date' => '2027-04-30',
                'line_amount' => 15000000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'stock_receipt_id' => $rcpt2Id,
                'material_id' => $matHaifaCalMagId,
                'quantity' => 80,
                'unit_price' => 550000,
                'batch_code' => 'BATCH-HC-2025-01',
                'expiry_date' => '2028-11-01',
                'line_amount' => 44000000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'stock_receipt_id' => $rcpt2Id,
                'material_id' => $matGiongRedId,
                'quantity' => 20,
                'unit_price' => 900000,
                'batch_code' => 'BATCH-GIONG-RED-01',
                'expiry_date' => '2026-11-01',
                'line_amount' => 18000000,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 10. Stock Issues (3 Phiếu xuất nợ vật tư đầu vụ - Credit Advance)
        $issue1Id = (string) Str::uuid();
        $issue2Id = (string) Str::uuid();
        $issue3Id = (string) Str::uuid();

        DB::table('stock_issues')->insert([
            [
                'id' => $issue1Id,
                'cooperative_id' => $coopId,
                'warehouse_id' => $warehouseId,
                'issue_number' => 'PXK-2025-001',
                'issue_date' => '2025-11-05',
                'member_id' => $memberIdMap['TV001'],
                'purpose' => 'Xuất nợ phân bón đầu vụ cho xã viên Nguyễn Văn A (TV001)',
                'is_credit' => true,
                'status' => 'APPROVED',
                'total_amount' => 7500000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $issue2Id,
                'cooperative_id' => $coopId,
                'warehouse_id' => $warehouseId,
                'issue_number' => 'PXK-2025-002',
                'issue_date' => '2025-11-08',
                'member_id' => $memberIdMap['TV002'],
                'purpose' => 'Xuất nợ phân trùn quế & thuốc Neem Oil cho xã viên Trần Thị B (TV002)',
                'is_credit' => true,
                'status' => 'APPROVED',
                'total_amount' => 5500000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $issue3Id,
                'cooperative_id' => $coopId,
                'warehouse_id' => $warehouseId,
                'issue_number' => 'PXK-2025-003',
                'issue_date' => '2025-11-12',
                'member_id' => $memberIdMap['TV004'],
                'purpose' => 'Xuất nợ dinh dưỡng Haifa Cal-Mag cho xã viên liên kết Phạm Thị D (TV004)',
                'is_credit' => true,
                'status' => 'APPROVED',
                'total_amount' => 12000000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('stock_issue_lines')->insert([
            [
                'id' => (string) Str::uuid(),
                'stock_issue_id' => $issue1Id,
                'material_id' => $matBioGrowId,
                'quantity' => 15,
                'unit_price' => 500000,
                'batch_code' => 'BATCH-BG-2025-01',
                'line_amount' => 7500000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'stock_issue_id' => $issue2Id,
                'material_id' => $matBioGrowId,
                'quantity' => 10,
                'unit_price' => 500000,
                'batch_code' => 'BATCH-BG-2025-01',
                'line_amount' => 5000000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'stock_issue_id' => $issue2Id,
                'material_id' => $matNeemOilId,
                'quantity' => 2,
                'unit_price' => 250000,
                'batch_code' => 'BATCH-NO-2025-02',
                'line_amount' => 500000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'stock_issue_id' => $issue3Id,
                'material_id' => $matHaifaCalMagId,
                'quantity' => 20,
                'unit_price' => 600000,
                'batch_code' => 'BATCH-HC-2025-01',
                'line_amount' => 12000000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 11. Receivable Payables (4 Bản ghi công nợ mở của các xã viên)
        $debt1Id = (string) Str::uuid();
        $debt2Id = (string) Str::uuid();
        $debt3Id = (string) Str::uuid();
        $debt4Id = (string) Str::uuid();

        DB::table('receivable_payables')->insert([
            [
                'id' => $debt1Id,
                'cooperative_id' => $coopId,
                'debt_code' => 'CN-VT-2025-001',
                'counterparty_type' => 'MEMBER',
                'counterparty_id' => $memberIdMap['TV001'],
                'counterparty_name' => 'Nguyễn Văn A',
                'member_id' => $memberIdMap['TV001'],
                'debt_type' => 'RECEIVABLE',
                'original_amount' => 7500000,
                'outstanding_amount' => 7500000,
                'due_date' => '2026-03-31',
                'description' => 'Nợ vật tư 15 bao phân Bio-Grow đầu vụ Đông Xuân 2025-2026 (Phiếu xuất PXK-2025-001)',
                'status' => 'OPEN',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $debt2Id,
                'cooperative_id' => $coopId,
                'debt_code' => 'CN-VT-2025-002',
                'counterparty_type' => 'MEMBER',
                'counterparty_id' => $memberIdMap['TV002'],
                'counterparty_name' => 'Trần Thị B',
                'member_id' => $memberIdMap['TV002'],
                'debt_type' => 'RECEIVABLE',
                'original_amount' => 5500000,
                'outstanding_amount' => 5500000,
                'due_date' => '2026-03-31',
                'description' => 'Nợ vật tư 10 bao phân Bio-Grow & 2 chai Neem Oil (Phiếu xuất PXK-2025-002)',
                'status' => 'OPEN',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $debt3Id,
                'cooperative_id' => $coopId,
                'debt_code' => 'CN-VT-2025-003',
                'counterparty_type' => 'MEMBER',
                'counterparty_id' => $memberIdMap['TV004'],
                'counterparty_name' => 'Phạm Thị D',
                'member_id' => $memberIdMap['TV004'],
                'debt_type' => 'RECEIVABLE',
                'original_amount' => 12000000,
                'outstanding_amount' => 12000000,
                'due_date' => '2026-04-15',
                'description' => 'Nợ dinh dưỡng vi lượng Haifa Cal-Mag Israel (Phiếu xuất PXK-2025-003)',
                'status' => 'OPEN',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $debt4Id,
                'cooperative_id' => $coopId,
                'debt_code' => 'CN-VT-2025-004',
                'counterparty_type' => 'MEMBER',
                'counterparty_id' => $memberIdMap['TV005'],
                'counterparty_name' => 'Hoàng Văn E',
                'member_id' => $memberIdMap['TV005'],
                'debt_type' => 'RECEIVABLE',
                'original_amount' => 6000000,
                'outstanding_amount' => 6000000,
                'due_date' => '2025-12-31',
                'description' => 'Nợ tiền phân bón vi sinh vụ trước (Quá hạn 6 tháng theo dõi thu hồi)',
                'status' => 'OPEN',
                'created_at' => $now->subMonths(6),
                'updated_at' => $now,
            ]
        ]);

        $adminUser = DB::table('users')->where('username', 'admin')->first()
            ?? DB::table('users')->where('username', 'admin_htx')->first();
        $adminUserId = $adminUser ? $adminUser->id : null;

        // 12. Farming Logs (12 Nhật ký canh tác chuẩn 10 trường TT02/2024 & VietGAP)
        DB::table('farming_logs')->insert([
            // Vụ Đông Xuân 2025-2026
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'LAND_PREPARATION',
                'activity_date' => '2025-11-05',
                'description' => 'Cày xới đất tơi xốp sâu 30cm, bón vôi bột khử trùng đáy nhà kính Hòn Bồ và phơi ải 5 ngày',
                'performed_by' => $adminUserId,
                'attachment_reference' => json_encode([
                    'photo_url' => 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80'
                ]),
                'material_id' => null,
                'material_batch_number' => null,
                'quantity_applied' => null,
                'unit' => null,
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'FERTILIZATION',
                'activity_date' => '2025-11-10',
                'description' => 'Bón lót đáy luống nhà kính Hòn Bồ 15 bao phân trùn quế Bio-Grow, phủ màng nông nghiệp giữ ẩm',
                'performed_by' => $adminUserId,
                'attachment_reference' => json_encode([
                    'photo_url' => 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
                ]),
                'material_id' => $matBioGrowId,
                'material_batch_number' => 'BATCH-BG-2025-01',
                'quantity_applied' => 15,
                'unit' => 'bao_25kg',
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'PLANTING',
                'activity_date' => '2025-11-15',
                'description' => 'Xuống giống 1000 cây giống ớt chuông Sweet Palermo Đỏ F1 (25 ngày tuổi, khỏe mạnh, sạch bệnh)',
                'performed_by' => $adminUserId,
                'attachment_reference' => json_encode([
                    'photo_url' => 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80'
                ]),
                'material_id' => $matGiongRedId,
                'material_batch_number' => 'BATCH-GIONG-RED-01',
                'quantity_applied' => 1,
                'unit' => 'goi_1000hat',
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'IRRIGATION',
                'activity_date' => '2025-11-28',
                'description' => 'Châm dinh dưỡng vi lượng Haifa Cal-Mag nồng độ EC 1.8 qua hệ thống tưới nhỏ giọt bù áp tự động Israel',
                'performed_by' => $adminUserId,
                'attachment_reference' => null,
                'material_id' => $matHaifaCalMagId,
                'material_batch_number' => 'BATCH-HC-2025-01',
                'quantity_applied' => 5,
                'unit' => 'bao_25kg',
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'PRUNING',
                'activity_date' => '2025-12-10',
                'description' => 'Tỉa cành phụ dưới cháng chữ V, bấm ngọn định hình 2 thân chính và căng dây dù treo giàn',
                'performed_by' => $adminUserId,
                'attachment_reference' => null,
                'material_id' => null,
                'material_batch_number' => null,
                'quantity_applied' => null,
                'unit' => null,
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'PEST_CONTROL',
                'activity_date' => '2025-12-18',
                'description' => 'Treo bẫy dính màu vàng Pheromone mật độ 40 tấm/1000m² để theo dõi và phòng trừ bọ trĩ sinh học',
                'performed_by' => $adminUserId,
                'attachment_reference' => null,
                'material_id' => null,
                'material_batch_number' => null,
                'quantity_applied' => 40,
                'unit' => 'tam_bay',
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'PEST_CONTROL',
                'activity_date' => '2025-12-20',
                'description' => 'Phun phòng trừ bọ trĩ và rệp muội bằng chế phẩm Neem Oil sinh học 1000EC (Liều lượng 20ml / 16L nước)',
                'performed_by' => $adminUserId,
                'attachment_reference' => json_encode([
                    'photo_url' => 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
                ]),
                'material_id' => $matNeemOilId,
                'material_batch_number' => 'BATCH-NO-2025-02',
                'quantity_applied' => 2,
                'unit' => 'chai_1L',
                'phi_days' => 3,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'PEST_CONTROL',
                'activity_date' => '2025-12-28',
                'description' => 'Tưới gốc chế phẩm vi sinh đối kháng Trichoderma Bio-VT phòng ngừa nấm Fusarium gây héo rũ gốc',
                'performed_by' => $adminUserId,
                'attachment_reference' => null,
                'material_id' => $matTrichoId,
                'material_batch_number' => 'BATCH-TRI-2025-01',
                'quantity_applied' => 2,
                'unit' => 'goi_1kg',
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'MONITORING',
                'activity_date' => '2026-01-08',
                'description' => 'Kiểm tra độ chín quang trắc trước thu hoạch: Vỏ quả chuyển đỏ đậm bóng, độ Brix khúc xạ kế đạt 8.8%',
                'performed_by' => $adminUserId,
                'attachment_reference' => null,
                'material_id' => null,
                'material_batch_number' => null,
                'quantity_applied' => null,
                'unit' => null,
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'activity_type' => 'HARVEST',
                'activity_date' => '2026-01-10',
                'description' => 'Thu hoạch lứa đầu tiên tuyển chọn KCS Grade A, đóng thùng carton đục lỗ 5kg xuất về kho sơ chế',
                'performed_by' => $adminUserId,
                'attachment_reference' => json_encode([
                    'photo_url' => 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80'
                ]),
                'material_id' => $matBaoBiId,
                'material_batch_number' => 'BATCH-BB-2025-01',
                'quantity_applied' => 250,
                'unit' => 'thung',
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // 2 Nhật ký thuộc Vụ Thu Đông 2025 (COMPLETED - Để kiểm tra tính năng Freeze Guard)
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCompletedId,
                'plot_id' => $plot1Id,
                'activity_type' => 'FERTILIZATION',
                'activity_date' => '2025-09-15',
                'description' => 'Bón thúc đợt cuối nuôi quả vụ Thu Đông 2025 bằng phân trùn quế hữu cơ',
                'performed_by' => $adminUserId,
                'attachment_reference' => null,
                'material_id' => $matBioGrowId,
                'material_batch_number' => 'BATCH-BG-2025-01',
                'quantity_applied' => 10,
                'unit' => 'bao_25kg',
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now->subMonths(3),
                'updated_at' => $now->subMonths(3),
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonCompletedId,
                'plot_id' => $plot1Id,
                'activity_type' => 'HARVEST',
                'activity_date' => '2025-10-20',
                'description' => 'Thu hoạch dứt điểm toàn bộ sản lượng vụ Thu Đông 2025 bàn giao siêu thị',
                'performed_by' => $adminUserId,
                'attachment_reference' => null,
                'material_id' => $matBaoBiId,
                'material_batch_number' => 'BATCH-BB-2025-01',
                'quantity_applied' => 400,
                'unit' => 'thung',
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now->subMonths(2),
                'updated_at' => $now->subMonths(2),
            ],
        ]);

        // 13. Products (4 Sản phẩm OCOP đạt chuẩn 3 và 4 sao)
        $prodRedId = (string) Str::uuid();
        $prodYelId = (string) Str::uuid();
        $prodLettuceId = (string) Str::uuid();
        $prodStrawId = (string) Str::uuid();

        DB::table('products')->insert([
            [
                'id' => $prodRedId,
                'cooperative_id' => $coopId,
                'product_code' => 'PRD-PALERMO-RED',
                'product_name' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
                'category' => 'Rau, củ, quả, hạt tươi',
                'brand' => 'HTX Nông Nghiệp Tân Tiến Đà Lạt',
                'specification' => json_encode([
                    'net_weight' => '5kg/thùng (hoặc túi hút chân không 500g)',
                    'packaging' => 'Thùng carton 5 lớp có túi đục lỗ thoáng khí',
                    'shelf_life' => '21 ngày ở 8-10°C'
                ]),
                'quality_information' => json_encode([
                    'certification' => 'VietGAP TCVN 11892-1:2017',
                    'cert_no' => 'VG-49-2024-0089',
                    'cert_date' => '2024-06-15',
                    'brix_level' => '≥ 8.5',
                    'ocop_stars' => 4,
                    'target_market' => 'Chuỗi siêu thị WinMart, Big C, An Nam Gourmet'
                ]),
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $prodYelId,
                'cooperative_id' => $coopId,
                'product_code' => 'PRD-PALERMO-YEL',
                'product_name' => 'Ớt chuông Sweet Palermo Vàng Đà Lạt',
                'category' => 'Rau, củ, quả, hạt tươi',
                'brand' => 'HTX Nông Nghiệp Tân Tiến Đà Lạt',
                'specification' => json_encode([
                    'net_weight' => 'Hộp carton 1kg có màng thoáng khí',
                    'packaging' => 'Hộp giấy Kraft thân thiện môi trường',
                    'shelf_life' => '18 ngày ở 8-10°C'
                ]),
                'quality_information' => json_encode([
                    'certification' => 'VietGAP',
                    'cert_no' => 'VG-49-2024-0089',
                    'cert_date' => '2024-06-15',
                    'brix_level' => '≥ 9.0',
                    'ocop_stars' => 4,
                    'target_market' => 'Thị trường nội địa cao cấp'
                ]),
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $prodLettuceId,
                'cooperative_id' => $coopId,
                'product_code' => 'PRD-LETTUCE-01',
                'product_name' => 'Xà Lách Thủy Canh Mỡ Đà Lạt',
                'category' => 'Rau ăn lá thủy canh',
                'brand' => 'HTX Nông Nghiệp Tân Tiến',
                'specification' => json_encode([
                    'net_weight' => 'Túi màng sinh học 300g giữ nguyên rễ',
                    'packaging' => 'Túi màng sinh học tự phân hủy',
                    'shelf_life' => '7-10 ngày'
                ]),
                'quality_information' => json_encode([
                    'certification' => 'VietGAP',
                    'cert_no' => 'VG-49-2025-0112',
                    'cert_date' => '2025-01-10',
                    'brix_level' => 'N/A',
                    'ocop_stars' => 3,
                    'target_market' => 'Nhà hàng, khách sạn tại Đà Lạt và TP.HCM'
                ]),
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $prodStrawId,
                'cooperative_id' => $coopId,
                'product_code' => 'PRD-STRAWBERRY-01',
                'product_name' => 'Dâu Tây Hana Giống Nhật Đạ Sar',
                'category' => 'Trái cây tươi cao cấp',
                'brand' => 'HTX Nông Nghiệp Tân Tiến',
                'specification' => json_encode([
                    'net_weight' => 'Hộp 500g định hình chống dập',
                    'packaging' => 'Hộp nhựa PET nguyên sinh chuyên dụng xuất khẩu',
                    'shelf_life' => '5-7 ngày bảo quản lạnh'
                ]),
                'quality_information' => json_encode([
                    'certification' => 'VietGAP',
                    'cert_no' => 'VG-49-2024-0095',
                    'cert_date' => '2024-04-20',
                    'brix_level' => '≥ 11.5',
                    'ocop_stars' => 4,
                    'target_market' => 'Chuỗi cửa hàng trái cây nhập khẩu'
                ]),
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 14. Harvests & Lots (4 Đợt thu hoạch KCS & 4 Lô hàng GS1 tem QR)
        $harv1Id = (string) Str::uuid();
        $harv2Id = (string) Str::uuid();
        $harv3Id = (string) Str::uuid();
        $harv4Id = (string) Str::uuid();

        $lot1Id = (string) Str::uuid();
        $lot2Id = (string) Str::uuid();
        $lot3Id = (string) Str::uuid();
        $lot4Id = (string) Str::uuid();

        DB::table('harvests')->insert([
            [
                'id' => $harv1Id,
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot1Id,
                'harvest_date' => '2026-01-10',
                'quantity' => 1500,
                'unit' => 'kg',
                'grade' => 'GRADE_A',
                'brix_level' => 8.8,
                'uniformity_rate' => 96.0,
                'kcs_status' => 'PASSED',
                'kcs_gate_check' => json_encode([
                    'phi_passed' => true,
                    'phi_days' => 3,
                    'visual_inspection' => 'Quả đỏ bóng, thuôn dài 20-25cm, không dập gãy',
                    'inspector' => 'KCS_LE_TRONG'
                ]),
                'kcs_quick_lab' => json_encode([
                    'pesticide_ppm' => 0.002,
                    'max_allowed_ppm' => 0.05,
                    'heavy_metals' => 'UNDETECTED',
                    'lab_code' => 'TEST-2026-089'
                ]),
                'quality_information' => json_encode([
                    'grade_a_kg' => 1250,
                    'grade_b_kg' => 200,
                    'reject_kg' => 50,
                    'is_settled' => true
                ]),
                'lot_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $harv2Id,
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot2Id,
                'harvest_date' => '2026-01-15',
                'quantity' => 1200,
                'unit' => 'kg',
                'grade' => 'GRADE_A',
                'brix_level' => 9.2,
                'uniformity_rate' => 95.0,
                'kcs_status' => 'PASSED',
                'kcs_gate_check' => json_encode([
                    'phi_passed' => true,
                    'phi_days' => 0,
                    'visual_inspection' => 'Quả vàng óng, ngọt thanh giòn ngọt',
                    'inspector' => 'KCS_LE_TRONG'
                ]),
                'kcs_quick_lab' => json_encode([
                    'pesticide_ppm' => 0.001,
                    'max_allowed_ppm' => 0.05,
                    'heavy_metals' => 'UNDETECTED',
                    'lab_code' => 'TEST-2026-092'
                ]),
                'quality_information' => json_encode([
                    'grade_a_kg' => 1000,
                    'grade_b_kg' => 150,
                    'reject_kg' => 50,
                    'is_settled' => false
                ]),
                'lot_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $harv3Id,
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot4Id,
                'harvest_date' => '2026-01-18',
                'quantity' => 850,
                'unit' => 'kg',
                'grade' => 'GRADE_A',
                'brix_level' => null,
                'uniformity_rate' => 98.0,
                'kcs_status' => 'PASSED',
                'kcs_gate_check' => json_encode([
                    'phi_passed' => true,
                    'phi_days' => 0,
                    'visual_inspection' => 'Xà lách mỡ lá xanh mướt, rễ trắng khỏe',
                    'inspector' => 'KCS_TRAN_KHO'
                ]),
                'kcs_quick_lab' => json_encode([
                    'nitrate_ppm' => 450,
                    'max_allowed_ppm' => 1500,
                    'heavy_metals' => 'UNDETECTED',
                    'lab_code' => 'TEST-2026-095'
                ]),
                'quality_information' => json_encode([
                    'grade_a_kg' => 800,
                    'grade_b_kg' => 50,
                    'reject_kg' => 0,
                    'is_settled' => false
                ]),
                'lot_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $harv4Id,
                'crop_season_id' => $seasonCurrentId,
                'plot_id' => $plot3Id,
                'harvest_date' => '2026-01-20',
                'quantity' => 600,
                'unit' => 'kg',
                'grade' => 'GRADE_A',
                'brix_level' => 11.5,
                'uniformity_rate' => 94.0,
                'kcs_status' => 'PASSED',
                'kcs_gate_check' => json_encode([
                    'phi_passed' => true,
                    'phi_days' => 0,
                    'visual_inspection' => 'Dâu tây đỏ mọng 90%, thơm ngọt đậm đà',
                    'inspector' => 'KCS_LE_TRONG'
                ]),
                'kcs_quick_lab' => json_encode([
                    'pesticide_ppm' => 0.000,
                    'max_allowed_ppm' => 0.05,
                    'heavy_metals' => 'UNDETECTED',
                    'lab_code' => 'TEST-2026-099'
                ]),
                'quality_information' => json_encode([
                    'grade_a_kg' => 550,
                    'grade_b_kg' => 50,
                    'reject_kg' => 0,
                    'is_settled' => false
                ]),
                'lot_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('lots')->insert([
            [
                'id' => $lot1Id,
                'lot_code' => 'LOT-TT-2026-001',
                'harvest_id' => $harv1Id,
                'quantity' => 1250,
                'unit' => 'kg',
                'status' => 'PACKAGED',
                'source_information' => json_encode([
                    'cooperative' => 'HTX Nông Nghiệp Tân Tiến',
                    'plot_code' => 'PLOT-TT-XV001-01',
                    'puc_code' => 'PUC-49-015-9923',
                    'crop' => 'Ớt chuông Sweet Palermo Đỏ',
                    'packaging_date' => '2026-01-11',
                    'qr_url' => 'https://trace.ocop.gov.vn/lot/LOT-TT-2026-001'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $lot2Id,
                'lot_code' => 'LOT-TT-2026-002',
                'harvest_id' => $harv2Id,
                'quantity' => 1000,
                'unit' => 'kg',
                'status' => 'PACKAGED',
                'source_information' => json_encode([
                    'cooperative' => 'HTX Nông Nghiệp Tân Tiến',
                    'plot_code' => 'PLOT-TT-XV001-02',
                    'puc_code' => 'PUC-49-015-9923',
                    'crop' => 'Ớt chuông Sweet Palermo Vàng',
                    'packaging_date' => '2026-01-16',
                    'qr_url' => 'https://trace.ocop.gov.vn/lot/LOT-TT-2026-002'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $lot3Id,
                'lot_code' => 'LOT-TT-2026-003',
                'harvest_id' => $harv3Id,
                'quantity' => 800,
                'unit' => 'kg',
                'status' => 'PACKAGED',
                'source_information' => json_encode([
                    'cooperative' => 'HTX Nông Nghiệp Tân Tiến',
                    'plot_code' => 'PLOT-TT-XV003-01',
                    'puc_code' => 'PUC-49-015-9923',
                    'crop' => 'Xà Lách Thủy Canh Mỡ Đà Lạt',
                    'packaging_date' => '2026-01-19',
                    'qr_url' => 'https://trace.ocop.gov.vn/lot/LOT-TT-2026-003'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $lot4Id,
                'lot_code' => 'LOT-TT-2026-004',
                'harvest_id' => $harv4Id,
                'quantity' => 550,
                'unit' => 'kg',
                'status' => 'PACKAGED',
                'source_information' => json_encode([
                    'cooperative' => 'HTX Nông Nghiệp Tân Tiến',
                    'plot_code' => 'PLOT-TT-XV002-01',
                    'puc_code' => 'PUC-49-015-9924',
                    'crop' => 'Dâu Tây Hana Giống Nhật Đạ Sar',
                    'packaging_date' => '2026-01-21',
                    'qr_url' => 'https://trace.ocop.gov.vn/lot/LOT-TT-2026-004'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // Update circular FKs in harvests
        DB::table('harvests')->where('id', $harv1Id)->update(['lot_id' => $lot1Id]);
        DB::table('harvests')->where('id', $harv2Id)->update(['lot_id' => $lot2Id]);
        DB::table('harvests')->where('id', $harv3Id)->update(['lot_id' => $lot3Id]);
        DB::table('harvests')->where('id', $harv4Id)->update(['lot_id' => $lot4Id]);

        // Link Lots to Products
        DB::table('product_lots')->insert([
            ['product_id' => $prodRedId, 'lot_id' => $lot1Id, 'quantity' => 1250, 'created_at' => $now],
            ['product_id' => $prodYelId, 'lot_id' => $lot2Id, 'quantity' => 1000, 'created_at' => $now],
            ['product_id' => $prodLettuceId, 'lot_id' => $lot3Id, 'quantity' => 800, 'created_at' => $now],
            ['product_id' => $prodStrawId, 'lot_id' => $lot4Id, 'quantity' => 550, 'created_at' => $now],
        ]);

        // 15. Ocop Applications (2 Hồ sơ OCOP)
        $criteriaVersion = DB::table('criteria_versions')->where('status', 'PUBLISHED')->first();
        $cvId = $criteriaVersion ? $criteriaVersion->id : '3ebdcd43-f84f-4309-8642-1f1e563deed7';

        $app1Id = (string) Str::uuid();
        $app2Id = (string) Str::uuid();

        DB::table('ocop_applications')->insert([
            [
                'id' => $app1Id,
                'cooperative_id' => $coopId,
                'product_id' => $prodRedId,
                'criteria_version_id' => $cvId,
                'application_number' => 'OCOP-2026-DALAT-001',
                'application_type' => 'NEW_EVALUATION',
                'status' => 'SUBMITTED',
                'submitted_at' => '2026-01-12 09:00:00',
                'completed_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $app2Id,
                'cooperative_id' => $coopId,
                'product_id' => $prodLettuceId,
                'criteria_version_id' => $cvId,
                'application_number' => 'OCOP-2025-LACDUONG-002',
                'application_type' => 'NEW_EVALUATION',
                'status' => 'SUBMITTED',
                'submitted_at' => '2025-08-20 14:00:00',
                'completed_at' => null,
                'created_at' => $now->subMonths(4),
                'updated_at' => $now->subMonths(4),
            ]
        ]);

        // 16. Final Decisions (2 Quyết định công nhận cấp sao OCOP)
        DB::table('final_decisions')->insert([
            [
                'id' => (string) Str::uuid(),
                'application_id' => $app1Id,
                'decision_number' => 'QĐ-UBND-2026-089',
                'decision_date' => '2026-01-15',
                'final_classification' => 'FOUR_STAR',
                'effective_date' => '2026-01-15',
                'authority_reference' => json_encode([
                    'issuer' => 'UBND Tỉnh Lâm Đồng',
                    'level' => 'PROVINCIAL',
                    'signer_name' => 'Nguyễn Minh Tuấn',
                    'signer_title' => 'Phó Chủ tịch UBND Tỉnh'
                ]),
                'document_reference' => json_encode([
                    'doc_url' => 'https://lamdong.gov.vn/van-ban/qd-2026-089.pdf',
                    'file_name' => 'Quyet_Dinh_Cong_Nhan_OCOP_4_Sao_Ot_Palermo.pdf'
                ]),
                'status' => 'ISSUED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'application_id' => $app2Id,
                'decision_number' => 'QĐ-UBND-2025-334',
                'decision_date' => '2025-09-01',
                'final_classification' => 'THREE_STAR',
                'effective_date' => '2025-09-01',
                'authority_reference' => json_encode([
                    'issuer' => 'UBND Huyện Lạc Dương',
                    'level' => 'DISTRICT',
                    'signer_name' => 'Trần Quang Hưng',
                    'signer_title' => 'Chủ tịch UBND Huyện'
                ]),
                'document_reference' => json_encode([
                    'doc_url' => 'https://lacduong.lamdong.gov.vn/van-ban/qd-2025-334.pdf',
                    'file_name' => 'Quyet_Dinh_Cong_Nhan_OCOP_3_Sao_Xa_Lach.pdf'
                ]),
                'status' => 'ISSUED',
                'created_at' => $now->subMonths(3),
                'updated_at' => $now->subMonths(3),
            ]
        ]);

        // 17. Cash Transactions (8 Giao dịch Sổ Quỹ Thu - Chi thực tế)
        $txSettleId = (string) Str::uuid();

        DB::table('cash_transactions')->insert([
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'voucher_number' => 'PT-2025-001',
                'transaction_number' => 'TXN-2025-001',
                'transaction_type' => 'INCOME',
                'amount' => 50000000,
                'transaction_date' => '2025-10-01',
                'category' => 'GOP_VON',
                'description' => 'Thu tiền mặt góp vốn điều lệ đợt 1 từ xã viên Nguyễn Văn A (TV001)',
                'payer_payee' => 'Nguyễn Văn A',
                'member_id' => $memberIdMap['TV001'],
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'voucher_number' => 'PT-2025-002',
                'transaction_number' => 'TXN-2025-002',
                'transaction_type' => 'INCOME',
                'amount' => 40000000,
                'transaction_date' => '2025-10-05',
                'category' => 'GOP_VON',
                'description' => 'Thu chuyển khoản Agribank góp vốn điều lệ từ xã viên Trần Thị B (TV002)',
                'payer_payee' => 'Trần Thị B',
                'member_id' => $memberIdMap['TV002'],
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'voucher_number' => 'PT-2025-003',
                'transaction_number' => 'TXN-2025-003',
                'transaction_type' => 'INCOME',
                'amount' => 25000000,
                'transaction_date' => '2025-10-10',
                'category' => 'GOP_VON',
                'description' => 'Thu tiền góp vốn thành viên liên kết từ xã viên Phạm Thị D (TV004)',
                'payer_payee' => 'Phạm Thị D',
                'member_id' => $memberIdMap['TV004'],
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'voucher_number' => 'PC-2025-001',
                'transaction_number' => 'TXN-2025-004',
                'transaction_type' => 'EXPENSE',
                'amount' => 25000000,
                'transaction_date' => '2025-10-25',
                'category' => 'MUA_VAT_TU',
                'description' => 'Thanh toán tạm ứng 50% tiền phân bón Bio-Grow cho nhà cung cấp',
                'payer_payee' => 'Công ty TNHH Bio-Grow Lâm Đồng',
                'member_id' => null,
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'voucher_number' => 'PC-2025-002',
                'transaction_number' => 'TXN-2025-005',
                'transaction_type' => 'EXPENSE',
                'amount' => 31000000,
                'transaction_date' => '2025-11-05',
                'category' => 'MUA_VAT_TU',
                'description' => 'Thanh toán tiền phân bón Haifa Cal-Mag Israel nhập kho PNK-2025-002',
                'payer_payee' => 'Công ty CP CNC Israel Việt Nam',
                'member_id' => null,
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'voucher_number' => 'PT-2026-001',
                'transaction_number' => 'TXN-2026-001',
                'transaction_type' => 'INCOME',
                'amount' => 43750000,
                'transaction_date' => '2026-01-12',
                'category' => 'BAN_NONG_SAN',
                'description' => 'Thu tiền bán 1.250kg Ớt chuông Sweet Palermo Đỏ Grade A cho Hệ thống WinMart',
                'payer_payee' => 'Tập đoàn Bán lẻ WinCommerce',
                'member_id' => null,
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $txSettleId,
                'cooperative_id' => $coopId,
                'voucher_number' => 'PC-2026-001',
                'transaction_number' => 'TXN-2026-002',
                'transaction_type' => 'EXPENSE',
                'amount' => 35156250,
                'transaction_date' => '2026-01-15',
                'category' => 'QUYET_TOAN_MUA_VU',
                'description' => 'Thanh toán tiền thu mua ớt chuông đợt 1 cho xã viên Nguyễn Văn A (sau khi cấn trừ 7.500.000đ nợ vật tư và 2.5% phí dịch vụ HTX)',
                'payer_payee' => 'Nguyễn Văn A',
                'member_id' => $memberIdMap['TV001'],
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'voucher_number' => 'PT-2026-002',
                'transaction_number' => 'TXN-2026-003',
                'transaction_type' => 'INCOME',
                'amount' => 1093750,
                'transaction_date' => '2026-01-15',
                'category' => 'PHI_DICH_VU_HTX',
                'description' => 'Thu phí dịch vụ hỗ trợ tiêu thụ 2.5% từ đợt quyết toán thu mua ớt chuông (43.750.000đ * 2.5%)',
                'payer_payee' => 'Quỹ điều hành HTX Tân Tiến',
                'member_id' => null,
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 18. Debt Settlement Record (Lịch sử quyết toán cấn trừ nợ mùa vụ)
        DB::table('debt_settlements')->insert([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopId,
            'debt_id' => $debt1Id,
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

        // 19. Evaluation Session (Phiên thẩm định Hội đồng OCOP)
        $councilLevel = DB::table('council_levels')->where('code', 'PROVINCE')->first();
        if ($councilLevel) {
            DB::table('evaluation_sessions')->insert([
                'id' => (string) Str::uuid(),
                'application_id' => $app1Id,
                'council_level_id' => $councilLevel->id,
                'status' => 'CONSOLIDATED',
                'started_at' => '2026-01-14 08:30:00',
                'completed_at' => '2026-01-14 17:00:00',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
