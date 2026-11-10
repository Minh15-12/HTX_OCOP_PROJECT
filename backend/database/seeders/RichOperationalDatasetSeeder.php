<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RichOperationalDatasetSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $coopId = 'a60ccf85-7301-43f7-b6d3-b25f72c75b78'; // HTX Phú Thịnh / Tân Tiến

        // 1. CROPS MASTER DATA (3 Giống Ớt chuông Sweet Palermo F1 chuyên canh công nghệ cao)
        $crops = [
            [
                'crop_code' => 'CROP-PALERMO-RED',
                'name' => 'Ớt Chuông Sweet Palermo Đỏ Đà Lạt',
                'scientific_name' => 'Capsicum annuum var. grossum',
                'category' => 'Rau củ quả OCOP',
                'description' => 'Giống ớt ngọt F1 Rijk Zwaan Hà Lan, không hăng cay, vỏ đỏ bóng, độ ngọt Brix 8.5 - 9.5°, giàu vitamin C và Lycopene.',
            ],
            [
                'crop_code' => 'CROP-PALERMO-YEL',
                'name' => 'Ớt Chuông Sweet Palermo Vàng Đà Lạt',
                'scientific_name' => 'Capsicum annuum var. grossum',
                'category' => 'Rau củ quả OCOP',
                'description' => 'Giống ớt ngọt F1 vỏ vàng óng, thịt quả dày giòn ngọt thanh, thích hợp ăn tươi salad và ép nước trái cây cao cấp.',
            ],
            [
                'crop_code' => 'CROP-PALERMO-ORG',
                'name' => 'Ớt Chuông Sweet Palermo Cam Đà Lạt',
                'scientific_name' => 'Capsicum annuum var. grossum',
                'category' => 'Rau củ quả OCOP',
                'description' => 'Vỏ cam tươi sáng, hương thơm trái cây đặc trưng, độ đồng đều cao, đạt chuẩn xuất khẩu sang thị trường Nhật Bản và Singapore.',
            ],
        ];

        foreach ($crops as $c) {
            $existing = DB::table('crops')->where('crop_code', $c['crop_code'])->first();
            if (!$existing) {
                DB::table('crops')->insert([
                    'id' => (string) Str::uuid(),
                    'crop_code' => $c['crop_code'],
                    'name' => $c['name'],
                    'scientific_name' => $c['scientific_name'],
                    'category' => $c['category'],
                    'description' => $c['description'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // 2. ADDITIONAL WAREHOUSES (Kho lạnh sau thu hoạch & Kho bao bì tem nhãn GS1)
        $whCool = DB::table('warehouses')->where('warehouse_code', 'WH-COOL-01')->first();
        if (!$whCool) {
            DB::table('warehouses')->insert([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'warehouse_code' => 'WH-COOL-01',
                'name' => 'Kho Lạnh Nông Sản Sau Thu Hoạch (8 - 10°C)',
                'location' => 'Khu sơ chế & đóng gói Hòn Bồ, Phường 12, TP. Đà Lạt',
                'manager_id' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $whPack = DB::table('warehouses')->where('warehouse_code', 'WH-PACK-01')->first();
        if (!$whPack) {
            DB::table('warehouses')->insert([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'warehouse_code' => 'WH-PACK-01',
                'name' => 'Kho Bao Bì Đóng Gói & Tem Mã Vạch GS1',
                'location' => 'Phân xưởng đóng gói trung tâm HTX',
                'manager_id' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 3. MATERIAL BATCHES (FEFO Tracking: Active, Near Expiry, Expired)
        $materials = DB::table('materials')->where('cooperative_id', $coopId)->get()->keyBy('sku');

        if ($materials->isNotEmpty()) {
            $batches = [
                // Phân trùn quế Bio-Grow
                [
                    'sku' => 'MAT-PHAN-01',
                    'batch_number' => 'LOT-BG-2025-01',
                    'quantity' => 65.0,
                    'initial_quantity' => 100.0,
                    'manufactured_at' => '2025-10-15',
                    'expired_at' => '2027-10-15', // Active
                    'status' => 'ACTIVE',
                ],
                [
                    'sku' => 'MAT-PHAN-01',
                    'batch_number' => 'LOT-BG-2024-FEFO-CANDATE',
                    'quantity' => 12.0,
                    'initial_quantity' => 50.0,
                    'manufactured_at' => '2024-11-20',
                    'expired_at' => '2026-11-20', // Near expiry (< 25 days)
                    'status' => 'ACTIVE',
                ],
                [
                    'sku' => 'MAT-PHAN-01',
                    'batch_number' => 'LOT-BG-2023-EXPIRED',
                    'quantity' => 4.0,
                    'initial_quantity' => 40.0,
                    'manufactured_at' => '2023-08-10',
                    'expired_at' => '2026-08-10', // Expired
                    'status' => 'EXPIRED',
                ],
                // Dinh dưỡng Haifa Cal-Mag Israel
                [
                    'sku' => 'MAT-PHAN-02',
                    'batch_number' => 'LOT-HC-2025-01',
                    'quantity' => 50.0,
                    'initial_quantity' => 80.0,
                    'manufactured_at' => '2025-11-01',
                    'expired_at' => '2028-11-01', // Active
                    'status' => 'ACTIVE',
                ],
                [
                    'sku' => 'MAT-PHAN-02',
                    'batch_number' => 'LOT-HC-2024-CANDATE',
                    'quantity' => 6.0,
                    'initial_quantity' => 30.0,
                    'manufactured_at' => '2024-11-15',
                    'expired_at' => '2026-11-15', // Near expiry (< 20 days)
                    'status' => 'ACTIVE',
                ],
                // Thuốc BVTV Neem Oil Sinh Học
                [
                    'sku' => 'MAT-BVTV-01',
                    'batch_number' => 'LOT-NEEM-2025-01',
                    'quantity' => 38.0,
                    'initial_quantity' => 60.0,
                    'manufactured_at' => '2025-05-10',
                    'expired_at' => '2027-05-10', // Active
                    'status' => 'ACTIVE',
                ],
                [
                    'sku' => 'MAT-BVTV-01',
                    'batch_number' => 'LOT-NEEM-2023-EXPIRED',
                    'quantity' => 3.0,
                    'initial_quantity' => 20.0,
                    'manufactured_at' => '2023-09-01',
                    'expired_at' => '2026-09-01', // Expired
                    'status' => 'EXPIRED',
                ],
                // Nấm đối kháng Trichoderma
                [
                    'sku' => 'MAT-BVTV-02',
                    'batch_number' => 'LOT-TRI-2025-01',
                    'quantity' => 45.0,
                    'initial_quantity' => 50.0,
                    'manufactured_at' => '2025-06-01',
                    'expired_at' => '2027-06-01', // Active
                    'status' => 'ACTIVE',
                ],
                // Hạt giống Sweet Palermo F1 Đỏ
                [
                    'sku' => 'MAT-GIONG-01',
                    'batch_number' => 'LOT-GIONG-RED-2025',
                    'quantity' => 18.0,
                    'initial_quantity' => 25.0,
                    'manufactured_at' => '2025-09-01',
                    'expired_at' => '2027-09-01', // Active
                    'status' => 'ACTIVE',
                ],
            ];

            foreach ($batches as $b) {
                if (isset($materials[$b['sku']])) {
                    $mat = $materials[$b['sku']];
                    $exists = DB::table('material_batches')
                        ->where('cooperative_id', $coopId)
                        ->where('batch_number', $b['batch_number'])
                        ->exists();

                    if (!$exists) {
                        DB::table('material_batches')->insert([
                            'id' => (string) Str::uuid(),
                            'cooperative_id' => $coopId,
                            'material_id' => $mat->id,
                            'stock_receipt_line_id' => null,
                            'batch_number' => $b['batch_number'],
                            'quantity' => $b['quantity'],
                            'initial_quantity' => $b['initial_quantity'],
                            'manufactured_at' => $b['manufactured_at'],
                            'expired_at' => $b['expired_at'],
                            'status' => $b['status'],
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }
                }
            }
        }

        // 4. LAND CONTRIBUTIONS (Góp quyền sử dụng đất theo Luật HTX 2023)
        $memberA = DB::table('members')->where('member_code', 'TV001')->first();
        $memberB = DB::table('members')->where('member_code', 'TV002')->first();
        $memberC = DB::table('members')->where('member_code', 'TV003')->first();
        $memberE = DB::table('members')->where('member_code', 'TV005')->first();

        $landDocs = [
            [
                'member' => $memberA,
                'cert_no' => 'GCN-QSDĐ-580123-A',
                'plot_num' => '45',
                'sheet_num' => '12',
                'area_sqm' => 4500.0,
                'land_type' => 'Đất trồng cây lâu năm',
                'unit_price' => 250000,
                'total_val' => 1125000000,
                'cadastral_status' => 'REGISTERED_CHANGE',
                'desc' => 'Góp quyền sử dụng đất thửa số 45 tại Thôn 2, Xã Mê Linh phục vụ xây dựng nhà màng VietGAP',
            ],
            [
                'member' => $memberB,
                'cert_no' => 'GCN-QSDĐ-580124-B',
                'plot_num' => '12',
                'sheet_num' => '08',
                'area_sqm' => 6500.0,
                'land_type' => 'Đất nông nghiệp nhà kính',
                'unit_price' => 300000,
                'total_val' => 1950000000,
                'cadastral_status' => 'REGISTERED_CHANGE',
                'desc' => 'Góp QSDĐ thửa 12 Thôn 1 Xã Tân Hà phục vụ trồng dâu tây Hana công nghệ cao',
            ],
            [
                'member' => $memberC,
                'cert_no' => 'GCN-QSDĐ-580125-C',
                'plot_num' => '30',
                'sheet_num' => '15',
                'area_sqm' => 3500.0,
                'land_type' => 'Đất nông nghiệp',
                'unit_price' => 200000,
                'total_val' => 700000000,
                'cadastral_status' => 'NOTARIZED',
                'desc' => 'Góp QSDĐ thửa 30 Thôn 4 Xã Mê Linh phục vụ trồng rau thủy canh hồi lưu NFT',
            ],
            [
                'member' => $memberE,
                'cert_no' => 'GCN-QSDĐ-580126-D',
                'plot_num' => '78',
                'sheet_num' => '22',
                'area_sqm' => 5000.0,
                'land_type' => 'Đất sản xuất nông nghiệp',
                'unit_price' => 220000,
                'total_val' => 1100000000,
                'cadastral_status' => 'PENDING',
                'desc' => 'Đang làm thủ tục công chứng đăng ký biến động góp QSDĐ thửa 78 Xã Tân Văn',
            ],
        ];

        foreach ($landDocs as $ld) {
            if ($ld['member']) {
                $exists = DB::table('land_contributions')->where('land_certificate_no', $ld['cert_no'])->exists();
                if (!$exists) {
                    $capId = (string) Str::uuid();
                    // 1. Insert capital_contribution
                    DB::table('capital_contributions')->insert([
                        'id' => $capId,
                        'member_id' => $ld['member']->id,
                        'contribution_type' => 'QUYEN_SU_DUNG_DAT',
                        'amount' => $ld['total_val'],
                        'value_description' => $ld['desc'],
                        'transaction_date' => '2024-02-15',
                        'status' => 'CONFIRMED',
                        'committed_amount' => $ld['total_val'],
                        'actual_amount' => $ld['total_val'],
                        'ownership_ratio' => round(($ld['total_val'] / 2500000000) * 100, 2),
                        'certificate_code' => 'VON-DAT-' . $ld['plot_num'],
                        'certificate_issue_date' => '2024-02-20',
                        'valuation_ref_doc' => 'Chứng thư thẩm định giá số 45/2024/CT-VALUATION',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    // 2. Insert land_contribution
                    DB::table('land_contributions')->insert([
                        'id' => (string) Str::uuid(),
                        'contribution_id' => $capId,
                        'land_certificate_no' => $ld['cert_no'],
                        'plot_number' => $ld['plot_num'],
                        'map_sheet_number' => $ld['sheet_num'],
                        'land_area_sqm' => $ld['area_sqm'],
                        'land_use_type' => $ld['land_type'],
                        'appraised_unit_price' => $ld['unit_price'],
                        'total_land_value' => $ld['total_val'],
                        'cadastral_status' => $ld['cadastral_status'],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }

        // 5. MEETINGS & VOTES (Đại hội thành viên HTX theo Luật HTX 2023)
        $users = DB::table('users')->where('cooperative_id', $coopId)->get()->keyBy('username');

        $meet1 = DB::table('meetings')->where('title', 'LIKE', '%Đại hội Thành viên Thường niên năm 2025%')->first();
        if (!$meet1) {
            $meet1Id = (string) Str::uuid();
            DB::table('meetings')->insert([
                'id' => $meet1Id,
                'cooperative_id' => $coopId,
                'meeting_type' => 'ANNUAL_GENERAL',
                'meeting_date' => '2025-03-25',
                'title' => 'Đại hội Thành viên Thường niên năm 2025',
                'description' => 'Tổng kết hoạt động sản xuất kinh doanh năm 2024, thông qua BCTC kiểm toán, kế hoạch phân phối lợi nhuận và phương án mở rộng vùng trồng VietGAP.',
                'status' => 'COMPLETED',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Votes for Meeting 1
            $voters = $users->values();
            foreach ($voters as $v) {
                DB::table('votes')->insert([
                    'id' => (string) Str::uuid(),
                    'meeting_id' => $meet1Id,
                    'user_id' => $v->id,
                    'resolution_code' => 'NQ-01/2025/ĐHCD',
                    'choice' => 'FOR',
                    'weight' => 1.0000,
                    'resolution_type' => 'SURPLUS_DISTRIBUTION',
                    'created_at' => $now,
                ]);

                DB::table('votes')->insert([
                    'id' => (string) Str::uuid(),
                    'meeting_id' => $meet1Id,
                    'user_id' => $v->id,
                    'resolution_code' => 'NQ-02/2025/ĐHCD',
                    'choice' => ($v->username === 'xavien01') ? 'ABSTAIN' : 'FOR',
                    'weight' => 1.0000,
                    'resolution_type' => 'CAPITAL_INVESTMENT',
                    'created_at' => $now,
                ]);
            }
        }

        $meet2 = DB::table('meetings')->where('title', 'LIKE', '%Đại hội Thành viên Bất thường năm 2026%')->first();
        if (!$meet2) {
            $meet2Id = (string) Str::uuid();
            DB::table('meetings')->insert([
                'id' => $meet2Id,
                'cooperative_id' => $coopId,
                'meeting_type' => 'EXTRAORDINARY',
                'meeting_date' => '2026-09-15',
                'title' => 'Đại hội Thành viên Bất thường năm 2026',
                'description' => 'Thông qua dự án xây dựng thương hiệu OCOP 4 sao và đề án hợp tác chuỗi giá trị xuất khẩu nông sản sạch sang thị trường EU.',
                'status' => 'COMPLETED',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            foreach ($users->values() as $v) {
                DB::table('votes')->insert([
                    'id' => (string) Str::uuid(),
                    'meeting_id' => $meet2Id,
                    'user_id' => $v->id,
                    'resolution_code' => 'NQ-01/2026/ĐHBT',
                    'choice' => 'FOR',
                    'weight' => 1.0000,
                    'resolution_type' => 'OCOP_BRANDING',
                    'created_at' => $now,
                ]);
            }
        }

        // 6. LIVE PHI QUARANTINE LOGS (Tạo trường hợp Đang Cách Ly PHI & Đã An Toàn)
        $seasonCurrent = DB::table('crop_seasons')
            ->where('status', 'IN_PROGRESS')
            ->first();

        $plots = DB::table('farm_plots')->get()->keyBy('plot_code');

        if ($seasonCurrent && $plots->isNotEmpty()) {
            $adminUser = DB::table('users')->where('username', 'admin')->first()
                ?? DB::table('users')->where('username', 'admin_htx')->first();

            // 6. LIVE PHI QUARANTINE & MULTI-STATUS PLOTS (Đầy đủ cả 3 trạng thái: An toàn, Cách ly PHI, Nghỉ vụ)
            // Trường hợp 1: Thửa PLOT-TT-XV003-01 (Ớt Chuông Thủy Canh - VT-DALAT-01) ĐANG CÁCH LY PHI đến 2026-11-14
            if (isset($plots['PLOT-TT-XV003-01'])) {
                $pXv003 = $plots['PLOT-TT-XV003-01'];
                $safeDateXv003 = '2026-11-14';
                $landRel = json_decode($pXv003->land_relation ?? '{}', true) ?: [];
                $landRel['safe_harvest_date'] = $safeDateXv003;
                $landRel['phi_status'] = 'IN_QUARANTINE';

                DB::table('farm_plots')->where('id', $pXv003->id)->update([
                    'status' => 'IN_QUARANTINE',
                    'quarantine_until' => $safeDateXv003,
                    'land_relation' => json_encode($landRel),
                ]);

                if (!DB::table('farming_logs')->where('plot_id', $pXv003->id)->where('activity_date', '2026-11-04')->exists()) {
                    DB::table('farming_logs')->insert([
                        'id' => (string) Str::uuid(),
                        'crop_season_id' => $seasonCurrent->id,
                        'plot_id' => $pXv003->id,
                        'activity_type' => 'PEST_CONTROL',
                        'activity_date' => '2026-11-04',
                        'description' => 'Phun phòng trừ bọ trĩ sinh học đợt 4 bằng chế phẩm Neem Oil 1000EC (Liều 25ml/bình 16L). Khóa an toàn PHI 10 ngày (đến 2026-11-14).',
                        'performed_by' => $adminUser?->id,
                        'attachment_reference' => json_encode([
                            'photo_url' => 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
                            'safe_harvest_date' => $safeDateXv003,
                        ]),
                        'material_id' => $materials['MAT-BVTV-01']->id ?? null,
                        'material_batch_number' => 'LOT-NEEM-2025-01',
                        'quantity_applied' => 2.0,
                        'unit' => 'chai',
                        'phi_days' => 10,
                        'gps_latitude' => 11.9545,
                        'gps_longitude' => 108.4736,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            // Trường hợp 2: Thửa PLOT-TT-XV017-01 (Ớt Chuông Hòn Bồ - VT-DALAT-01) ĐANG CÁCH LY PHI đến 2026-11-16
            if (isset($plots['PLOT-TT-XV017-01'])) {
                $pXv017 = $plots['PLOT-TT-XV017-01'];
                $safeDateXv017 = '2026-11-16';
                $landRel = json_decode($pXv017->land_relation ?? '{}', true) ?: [];
                $landRel['safe_harvest_date'] = $safeDateXv017;
                $landRel['phi_status'] = 'IN_QUARANTINE';

                DB::table('farm_plots')->where('id', $pXv017->id)->update([
                    'status' => 'IN_QUARANTINE',
                    'quarantine_until' => $safeDateXv017,
                    'land_relation' => json_encode($landRel),
                ]);

                if (!DB::table('farming_logs')->where('plot_id', $pXv017->id)->where('activity_date', '2026-11-02')->exists()) {
                    DB::table('farming_logs')->insert([
                        'id' => (string) Str::uuid(),
                        'crop_season_id' => $seasonCurrent->id,
                        'plot_id' => $pXv017->id,
                        'activity_type' => 'PEST_CONTROL',
                        'activity_date' => '2026-11-02',
                        'description' => 'Phun phòng trừ nấm phấn trắng sinh học Trichoderma. Khóa an toàn PHI 14 ngày (đến 2026-11-16).',
                        'performed_by' => $adminUser?->id,
                        'attachment_reference' => json_encode([
                            'photo_url' => 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
                            'safe_harvest_date' => $safeDateXv017,
                        ]),
                        'material_id' => $materials['MAT-BVTV-01']->id ?? null,
                        'material_batch_number' => 'LOT-NEEM-2025-01',
                        'quantity_applied' => 1.5,
                        'unit' => 'chai',
                        'phi_days' => 14,
                        'gps_latitude' => 11.9560,
                        'gps_longitude' => 108.4748,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            // Trường hợp 3: Thửa PLOT-TT-XV006-01 (VT-DALAT-01) NGHỈ VỤ / CẢI TẠO ĐẤT
            if (isset($plots['PLOT-TT-XV006-01'])) {
                $pXv006 = $plots['PLOT-TT-XV006-01'];
                $landRel = json_decode($pXv006->land_relation ?? '{}', true) ?: [];
                $landRel['phi_status'] = 'FALLOW';

                DB::table('farm_plots')->where('id', $pXv006->id)->update([
                    'status' => 'FALLOW',
                    'quarantine_until' => null,
                    'land_relation' => json_encode($landRel),
                ]);
            }

            // Trường hợp 4: Thửa PLOT-TT-XV002-01 (Ớt Chuông Vàng - VT-DASAR-02) ĐANG CÁCH LY PHI đến 2026-11-15
            if (isset($plots['PLOT-TT-XV002-01'])) {
                $pDasar = $plots['PLOT-TT-XV002-01'];
                $safeDateDasar = '2026-11-15';
                $landRel = json_decode($pDasar->land_relation ?? '{}', true) ?: [];
                $landRel['safe_harvest_date'] = $safeDateDasar;
                $landRel['phi_status'] = 'IN_QUARANTINE';

                DB::table('farm_plots')->where('id', $pDasar->id)->update([
                    'status' => 'IN_QUARANTINE',
                    'quarantine_until' => $safeDateDasar,
                    'land_relation' => json_encode($landRel),
                ]);

                if (!DB::table('farming_logs')->where('plot_id', $pDasar->id)->where('activity_date', '2026-11-01')->exists()) {
                    DB::table('farming_logs')->insert([
                        'id' => (string) Str::uuid(),
                        'crop_season_id' => $seasonCurrent->id,
                        'plot_id' => $pDasar->id,
                        'activity_type' => 'PEST_CONTROL',
                        'activity_date' => '2026-11-01',
                        'description' => 'Phun phòng trừ bọ trĩ sinh học đợt 3 bằng chế phẩm Neem Oil 1000EC. Khóa an toàn PHI 14 ngày (đến 2026-11-15).',
                        'performed_by' => $adminUser?->id,
                        'attachment_reference' => json_encode([
                            'photo_url' => 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
                            'safe_harvest_date' => $safeDateDasar,
                        ]),
                        'material_id' => $materials['MAT-BVTV-01']->id ?? null,
                        'material_batch_number' => 'LOT-NEEM-2025-01',
                        'quantity_applied' => 2.0,
                        'unit' => 'chai',
                        'phi_days' => 14,
                        'gps_latitude' => 11.9515,
                        'gps_longitude' => 108.4725,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            // Trường hợp 5: Thửa PLOT-TT-XV013-01 (VT-TRAMHANH-03) NGHỈ VỤ / CẢI TẠO ĐẤT
            if (isset($plots['PLOT-TT-XV013-01'])) {
                $pXv013 = $plots['PLOT-TT-XV013-01'];
                $landRel = json_decode($pXv013->land_relation ?? '{}', true) ?: [];
                $landRel['phi_status'] = 'FALLOW';

                DB::table('farm_plots')->where('id', $pXv013->id)->update([
                    'status' => 'FALLOW',
                    'quarantine_until' => null,
                    'land_relation' => json_encode($landRel),
                ]);
            }

            // Trường hợp 6: Thửa PLOT-TT-XV001-01 (Ớt Chuông Đỏ - VT-DALAT-01) ĐÃ HẾT CÁCH LY AN TOÀN (CLEARED / ACTIVE)
            if (isset($plots['PLOT-TT-XV001-01'])) {
                $pRed = $plots['PLOT-TT-XV001-01'];
                $landRel = json_decode($pRed->land_relation ?? '{}', true) ?: [];
                $landRel['safe_harvest_date'] = '2026-10-20';
                $landRel['phi_status'] = 'CLEARED';

                DB::table('farm_plots')->where('id', $pRed->id)->update([
                    'status' => 'ACTIVE',
                    'quarantine_until' => null,
                    'land_relation' => json_encode($landRel),
                ]);

                // Thêm nhật ký kiểm tra Brix trước thu hoạch vào ngày 2026-10-29
                $monLogExists = DB::table('farming_logs')
                    ->where('plot_id', $pRed->id)
                    ->where('activity_date', '2026-10-29')
                    ->exists();

                if (!$monLogExists) {
                    DB::table('farming_logs')->insert([
                        'id' => (string) Str::uuid(),
                        'crop_season_id' => $seasonCurrent->id,
                        'plot_id' => $pRed->id,
                        'activity_type' => 'MONITORING',
                        'activity_date' => '2026-10-29',
                        'description' => 'Đo độ ngọt Brix bằng khúc xạ kế Atago đạt 8.9°Bx, kiểm tra dư lượng bằng Test kit Quick Lab âm tính. Đã hết hạn cách ly PHI, an toàn 100% để thu hoạch xuất xưởng.',
                        'performed_by' => $adminUser?->id,
                        'attachment_reference' => json_encode([
                            'photo_url' => 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
                            'brix' => 8.9,
                            'quick_lab' => 'PASSED',
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
                    ]);
                }
            }
        }

        // 7. ADDITIONAL HARVESTS & GS1 TRACEABILITY LOTS (Thêm 6 Đợt Thu Hoạch & Lô Hàng)
        $products = DB::table('products')->where('cooperative_id', $coopId)->get()->keyBy('product_code');

        if ($seasonCurrent && isset($plots['PLOT-TT-XV001-01'], $plots['PLOT-TT-XV001-02'], $plots['PLOT-TT-XV002-01'], $plots['PLOT-TT-XV003-01'])) {
            $extraHarvests = [
                [
                    'code' => 'HARV-2026-007',
                    'plot_code' => 'PLOT-TT-XV001-01',
                    'date' => '2026-10-25',
                    'qty' => 2200.0,
                    'grade' => 'GRADE_A',
                    'brix' => 9.1,
                    'uniformity' => 95.5,
                    'grade_a' => 1950.0,
                    'grade_b' => 200.0,
                    'reject' => 50.0,
                    'lot_code' => 'LOT-TT-2026-007',
                    'prod_code' => 'PRD-PALERMO-RED',
                    'lab_kit' => 'KIT-AGRO-LAB-2026-09',
                    'ppm' => 0.001,
                ],
                [
                    'code' => 'HARV-2026-008',
                    'plot_code' => 'PLOT-TT-XV001-02',
                    'date' => '2026-10-26',
                    'qty' => 1600.0,
                    'grade' => 'GRADE_A',
                    'brix' => 9.4,
                    'uniformity' => 94.0,
                    'grade_a' => 1450.0,
                    'grade_b' => 120.0,
                    'reject' => 30.0,
                    'lot_code' => 'LOT-TT-2026-008',
                    'prod_code' => 'PRD-PALERMO-YEL',
                    'lab_kit' => 'KIT-AGRO-LAB-2026-09',
                    'ppm' => 0.002,
                ],
                [
                    'code' => 'HARV-2026-009',
                    'plot_code' => 'PLOT-TT-XV003-01',
                    'date' => '2026-10-27',
                    'qty' => 1400.0,
                    'grade' => 'GRADE_A',
                    'brix' => 8.9,
                    'uniformity' => 96.0,
                    'grade_a' => 1250.0,
                    'grade_b' => 100.0,
                    'reject' => 50.0,
                    'lot_code' => 'LOT-TT-2026-009',
                    'prod_code' => 'PRD-PALERMO-RED',
                    'lab_kit' => 'KIT-AGRO-LAB-2026-09',
                    'ppm' => 0.0005,
                ],
                [
                    'code' => 'HARV-2026-010',
                    'plot_code' => 'PLOT-TT-XV002-01',
                    'date' => '2026-10-20',
                    'qty' => 1250.0,
                    'grade' => 'GRADE_A',
                    'brix' => 9.6,
                    'uniformity' => 94.0,
                    'grade_a' => 1100.0,
                    'grade_b' => 100.0,
                    'reject' => 50.0,
                    'lot_code' => 'LOT-TT-2026-010',
                    'prod_code' => 'PRD-PALERMO-ORG',
                    'lab_kit' => 'KIT-AGRO-LAB-2026-08',
                    'ppm' => 0.001,
                ],
                [
                    'code' => 'HARV-2026-011',
                    'plot_code' => 'PLOT-TT-XV001-02',
                    'date' => '2026-10-24',
                    'qty' => 1300.0,
                    'grade' => 'GRADE_A',
                    'brix' => 9.2,
                    'uniformity' => 93.0,
                    'grade_a' => 1150.0,
                    'grade_b' => 100.0,
                    'reject' => 50.0,
                    'lot_code' => 'LOT-TT-2026-011',
                    'prod_code' => 'PRD-PALERMO-YEL',
                    'lab_kit' => 'KIT-AGRO-LAB-2026-09',
                    'ppm' => 0.001,
                ],
                [
                    'code' => 'HARV-2026-012',
                    'plot_code' => 'PLOT-TT-XV001-01',
                    'date' => '2026-10-28',
                    'qty' => 450.0,
                    'grade' => 'REJECT',
                    'brix' => 6.2,
                    'uniformity' => 65.0,
                    'grade_a' => 0.0,
                    'grade_b' => 150.0,
                    'reject' => 300.0,
                    'lot_code' => 'LOT-TT-2026-012',
                    'prod_code' => 'PRD-PALERMO-RED',
                    'lab_kit' => 'KIT-AGRO-LAB-2026-10',
                    'ppm' => 0.045,
                ],
            ];

            foreach ($extraHarvests as $eh) {
                $exists = DB::table('lots')->where('lot_code', $eh['lot_code'])->exists();
                if (!$exists && isset($plots[$eh['plot_code']])) {
                    $hId = (string) Str::uuid();
                    $lId = (string) Str::uuid();
                    $plt = $plots[$eh['plot_code']];

                    // 1. Insert harvest
                    DB::table('harvests')->insert([
                        'id' => $hId,
                        'crop_season_id' => $seasonCurrent->id,
                        'plot_id' => $plt->id,
                        'harvest_date' => $eh['date'],
                        'quantity' => $eh['qty'],
                        'unit' => 'kg',
                        'grade' => $eh['grade'],
                        'brix_level' => $eh['brix'],
                        'uniformity_rate' => $eh['uniformity'],
                        'kcs_status' => ($eh['grade'] === 'REJECT') ? 'REJECTED' : 'PASSED',
                        'kcs_gate_check' => json_encode(['phi_passed' => true, 'inspector' => 'KCS_TRAN_DANG_KHOA']),
                        'kcs_quick_lab' => json_encode([
                            'test_result' => ($eh['grade'] === 'REJECT') ? 'LAB_REJECTED' : 'LAB_PASSED',
                            'ppm' => $eh['ppm'],
                            'kit_code' => $eh['lab_kit'],
                            'tester_name' => 'Kỹ sư KCS Nguyễn Văn Tuấn',
                            'tested_at' => $eh['date'],
                        ]),
                        'quality_information' => json_encode([
                            'grade_a_kg' => $eh['grade_a'],
                            'grade_b_kg' => $eh['grade_b'],
                            'reject_kg' => $eh['reject'],
                            'is_settled' => false,
                        ]),
                        'lot_id' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    // 2. Insert lot
                    DB::table('lots')->insert([
                        'id' => $lId,
                        'lot_code' => $eh['lot_code'],
                        'harvest_id' => $hId,
                        'quantity' => ($eh['grade'] === 'REJECT') ? $eh['reject'] : $eh['grade_a'],
                        'unit' => 'kg',
                        'status' => ($eh['grade'] === 'REJECT') ? 'DISPOSED' : 'PACKAGED',
                        'source_information' => json_encode([
                            'cooperative' => 'HTX Nông Nghiệp Tân Tiến',
                            'plot_code' => $eh['plot_code'],
                            'puc_code' => 'PUC-49-015-9923',
                            'crop' => 'Nông sản OCOP VietGAP',
                            'packaging_date' => $eh['date'],
                            'qr_url' => '/public/trace/' . $eh['lot_code'],
                        ]),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    // 3. Update harvest with lot_id
                    DB::table('harvests')->where('id', $hId)->update(['lot_id' => $lId]);

                    // 3. Link product_lots
                    if (isset($products[$eh['prod_code']])) {
                        DB::table('product_lots')->insert([
                            'product_id' => $products[$eh['prod_code']]->id,
                            'lot_id' => $lId,
                            'quantity' => ($eh['grade'] === 'REJECT') ? $eh['reject'] : $eh['grade_a'],
                            'created_at' => $now,
                        ]);
                    }
                }
            }
        }

        // 8. ADDITIONAL CASH TRANSACTIONS & RECEIVABLES AGING (Sổ Quỹ & Công Nợ Đa Dải Tuổi)
        $extraCash = [
            ['PT-2026-10-01', 'RECEIPT', 145000000, 'BANK_TRANSFER', 'Thu tiền bán nông sản Sweet Palermo OCOP theo hợp đồng WinCommerce Lô 007', '2026-10-26'],
            ['PT-2026-10-02', 'RECEIPT', 42000000, 'CASH', 'Thu tiền mặt xuất bán lẻ dâu tây Hana và xà lách thủy canh tại cửa hàng OCOP', '2026-10-27'],
            ['PT-2026-10-03', 'RECEIPT', 7500000, 'BANK_TRANSFER', 'Thu nợ vật tư trả chậm từ xã viên Nguyễn Văn A (CN-VT-2025-001)', '2026-10-28'],
            ['PC-2026-10-01', 'PAYMENT', 35000000, 'BANK_TRANSFER', 'Thanh toán tiền mua bao bì thùng carton đục lỗ và khay định hình OCOP', '2026-10-27'],
            ['PC-2026-10-02', 'PAYMENT', 12500000, 'BANK_TRANSFER', 'Chi phí phân tích mẫu kiểm nghiệm dư lượng BVTV tại Trung tâm Quatest 3', '2026-10-28'],
            ['PC-2026-10-03', 'PAYMENT', 45000000, 'CASH', 'Chi tạm ứng tiền công thu hoạch đợt 2 cho tổ dịch vụ nông nghiệp HTX', '2026-10-29'],
        ];

        foreach ($extraCash as $ec) {
            $exists = DB::table('cash_transactions')->where('voucher_number', $ec[0])->exists();
            if (!$exists) {
                DB::table('cash_transactions')->insert([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $coopId,
                    'voucher_number' => $ec[0],
                    'transaction_number' => 'TX-' . substr(md5($ec[0]), 0, 8),
                    'transaction_type' => $ec[1],
                    'amount' => $ec[2],
                    'transaction_date' => $ec[5],
                    'description' => $ec[4],
                    'category' => ($ec[1] === 'RECEIPT') ? 'NONG_SAN' : 'VAT_TU',
                    'payer_payee' => json_encode(['payment_method' => $ec[3]]),
                    'status' => 'POSTED',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // Additional Debts covering ALL aging buckets (0-30, 31-60, 61-90, >90, SETTLED)
        $extraDebts = [
            [
                'code' => 'CN-VT-2026-NEW-01',
                'name' => 'Nguyễn Thị Lan (Xã viên TV012)',
                'amount' => 8200000,
                'out_amount' => 8200000,
                'due_date' => '2026-11-25', // 0-30 ngày
                'desc' => 'Nợ vật tư phân bón lá vi lượng Haifa và chế phẩm sinh học Trichoderma vụ mới',
                'status' => 'OPEN',
            ],
            [
                'code' => 'CN-VT-2026-NEW-02',
                'name' => 'Trương Văn Hòa (Xã viên TV013)',
                'amount' => 14000000,
                'out_amount' => 14000000,
                'due_date' => '2026-12-10', // 31-60 ngày
                'desc' => 'Nợ phân hữu cơ trùn quế Bio-Grow và hạt giống ớt chuông Palermo vàng',
                'status' => 'OPEN',
            ],
            [
                'code' => 'CN-VT-2026-MID-01',
                'name' => 'Phan Đình Giáp (Xã viên TV015)',
                'amount' => 16500000,
                'out_amount' => 16500000,
                'due_date' => '2026-08-30', // 61-90 ngày quá hạn
                'desc' => 'Nợ tiền cây giống dâu tây Hana và hệ thống tưới nhỏ giọt bù áp (Quá hạn cần đôn đốc)',
                'status' => 'OPEN',
            ],
            [
                'code' => 'CN-VT-2025-OLD-01',
                'name' => 'Đoàn Minh Trí (Xã viên TV021)',
                'amount' => 22000000,
                'out_amount' => 22000000,
                'due_date' => '2026-05-31', // >90 ngày quá hạn
                'desc' => 'Khoản nợ phân bón và bao bì từ vụ trước, đã thông báo kỳ hạn thu nợ qua ĐHĐCĐ',
                'status' => 'OPEN',
            ],
            [
                'code' => 'CN-VT-2025-SETTLED-01',
                'name' => 'Nguyễn Văn A (Xã viên TV001)',
                'amount' => 7500000,
                'out_amount' => 0,
                'due_date' => '2026-10-25',
                'desc' => 'Đã cấn trừ và tất toán hoàn tất sau đợt thu hoạch ớt chuông Lô 007',
                'status' => 'SETTLED',
            ],
        ];

        foreach ($extraDebts as $ed) {
            $exists = DB::table('receivable_payables')->where('debt_code', $ed['code'])->exists();
            if (!$exists) {
                DB::table('receivable_payables')->insert([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $coopId,
                    'debt_code' => $ed['code'],
                    'counterparty_type' => 'MEMBER',
                    'counterparty_id' => null,
                    'counterparty_name' => $ed['name'],
                    'member_id' => null,
                    'debt_type' => 'RECEIVABLE',
                    'original_amount' => $ed['amount'],
                    'outstanding_amount' => $ed['out_amount'],
                    'due_date' => $ed['due_date'],
                    'description' => $ed['desc'],
                    'status' => $ed['status'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // 9. OCOP APPLICATION (Hồ sơ dự thảo Ớt chuông Sweet Palermo Cam - DRAFT để kiểm thử FSM)
        $criteriaVersion = DB::table('criteria_versions')->where('status', 'PUBLISHED')->first();
        $cvId = $criteriaVersion ? $criteriaVersion->id : '3ebdcd43-f84f-4309-8642-1f1e563deed7';

        if (isset($products['PRD-PALERMO-ORG'])) {
            $draftApp = DB::table('ocop_applications')->where('application_number', 'OCOP-2026-DONDUONG-005')->first();
            if (!$draftApp) {
                DB::table('ocop_applications')->insert([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $coopId,
                    'product_id' => $products['PRD-PALERMO-ORG']->id,
                    'criteria_version_id' => $cvId,
                    'application_number' => 'OCOP-2026-DONDUONG-005',
                    'application_type' => 'NEW_EVALUATION',
                    'status' => 'DRAFT',
                    'submitted_at' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }
}
