<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VietGapLogbookOperationalSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // 1. Lấy HTX Tân Tiến
        $coop = DB::table('cooperatives')->where('cooperative_code', 'HTX-TANTIEN-01')->first()
            ?? DB::table('cooperatives')->first();

        if (!$coop) {
            $this->command->warn('Không tìm thấy HTX trong hệ thống.');
            return;
        }

        $coopId = $coop->id;

        // 2. Lấy hoặc cập nhật Vụ Mùa Sweet Palermo Đỏ 2025 - 2026
        $season = DB::table('crop_seasons')
            ->where('crop', 'like', '%Palermo%')
            ->orderBy('created_at', 'desc')
            ->first() ?? DB::table('crop_seasons')->first();

        if (!$season) {
            $this->command->warn('Không tìm thấy Mùa vụ trong hệ thống.');
            return;
        }

        // Cập nhật thông tin VietGAP chuẩn Phụ lục F cho CropSeason
        DB::table('crop_seasons')->where('id', $season->id)->update([
            'seed_supplier' => 'Công ty TNHH Syngenta Việt Nam / Giống F1 Bokken',
            'seedling_standard_checklist' => json_encode([
                'age_days' => 32,
                'height_cm' => 16.5,
                'root_collar_mm' => 3.5,
                'true_leaves' => 5,
                'root_status' => 'Rễ trắng khỏe, rễ phân bố đều, không bó rễ, sạch nấm lở cổ rễ',
                'passed' => true,
            ]),
            'buyer_contract_info' => json_encode([
                'buyer_name' => 'Hệ thống Siêu thị WinCommerce & Xuất khẩu',
                'phc_code' => 'VN-LDO-PHC-0089',
                'contract_number' => 'HD-BAOTIEU-2026-01',
            ]),
            'puc_quota_kg' => 26250.00,
            'logbook_status' => 'ACTIVE',
            'updated_at' => $now,
        ]);

        // 3. Cập nhật FarmPlot chuẩn Điều 33 Luật Đất đai 2024
        $plots = DB::table('farm_plots')->where('production_unit_id', $season->production_unit_id)->get();
        if ($plots->isEmpty()) {
            $plots = DB::table('farm_plots')->limit(3)->get();
        }

        $plotIdx = 1;
        foreach ($plots as $p) {
            DB::table('farm_plots')->where('id', $p->id)->update([
                'national_cadastral_code' => '49-302-05-' . (127 + $plotIdx),
                'land_sheet_number' => '05',
                'land_parcel_number' => (string)(127 + $plotIdx),
                'substrate_bag_count' => 2500,
                'planting_density_per_sqm' => 2.5,
                'greenhouse_type' => 'HIGH_TECH_GREENHOUSE',
                'updated_at' => $now,
            ]);
            $plotIdx++;
        }

        $mainPlot = $plots->first();
        $adminUser = DB::table('users')->where('username', 'admin')->first()
            ?? DB::table('users')->first();
        $adminUserId = $adminUser ? $adminUser->id : null;

        // 4. Lấy vật tư trong kho
        $materialHaifa = DB::table('materials')->where('sku', 'MAT-PHAN-02')->first();
        $materialBioGrow = DB::table('materials')->where('sku', 'MAT-PHAN-01')->first();
        $materialNeem = DB::table('materials')->where('sku', 'MAT-BVTV-01')->first();
        $materialTricho = DB::table('materials')->where('sku', 'MAT-BVTV-02')->first();

        // 5. Nạp danh sách Farming Logs chuẩn VietGAP chi tiết
        $sampleLogs = [
            // Tab 2: Sổ Dinh dưỡng & Fertigation công nghệ cao
            [
                'crop_season_id' => $season->id,
                'plot_id' => $mainPlot->id,
                'activity_type' => 'FERTILIZATION',
                'fertigation_method' => 'DRIP_EMITTER',
                'ec_solution' => 1.9,
                'ec_drain' => 2.3,
                'ph_solution' => 5.9,
                'tank_composition' => json_encode([
                    'tank_a' => [['name' => 'YaraLiva Calcinit', 'kg' => 8]],
                    'tank_b' => [['name' => 'NPK 15-5-25 + Haifa Cal-Mag + Vi lượng EDTA', 'kg' => 7]],
                ]),
                'activity_date' => '2025-11-20',
                'description' => 'Châm dinh dưỡng nhỏ giọt giai đoạn nuôi quả rộ qua que ghim bù áp Israel. Kiểm soát EC đạt 1.9 mS/cm, pH 5.9',
                'performed_by' => $adminUserId,
                'material_id' => $materialHaifa ? $materialHaifa->id : null,
                'material_lot_number' => 'LOT-PB-2601',
                'material_export_slip_code' => 'PXK-HTX-0042',
                'quantity_applied' => 15.0,
                'unit' => 'kg',
                'phi_days' => 0,
            ],
            [
                'crop_season_id' => $season->id,
                'plot_id' => $mainPlot->id,
                'activity_type' => 'FERTILIZATION',
                'fertigation_method' => 'DRIP_EMITTER',
                'ec_solution' => 2.0,
                'ec_drain' => 2.4,
                'ph_solution' => 6.0,
                'tank_composition' => json_encode([
                    'tank_a' => [['name' => 'YaraLiva Calcinit', 'kg' => 10]],
                    'tank_b' => [['name' => 'NPK 12-12-36 + Vi lượng Boron', 'kg' => 10]],
                ]),
                'activity_date' => '2025-12-05',
                'description' => 'Châm phân nhỏ giọt thúc quả lớn đều, tăng độ dày cùi quả và ngừa thối đít quả do thiếu Canxi',
                'performed_by' => $adminUserId,
                'material_id' => $materialHaifa ? $materialHaifa->id : null,
                'material_lot_number' => 'LOT-PB-2601',
                'material_export_slip_code' => 'PXK-HTX-0042',
                'quantity_applied' => 20.0,
                'unit' => 'kg',
                'phi_days' => 0,
            ],
            [
                'crop_season_id' => $season->id,
                'plot_id' => $mainPlot->id,
                'activity_type' => 'FERTILIZATION',
                'fertigation_method' => 'DRENCH',
                'ec_solution' => 1.8,
                'ec_drain' => 2.2,
                'ph_solution' => 6.1,
                'activity_date' => '2025-12-18',
                'description' => 'Tưới gốc bổ sung phân hữu cơ sinh học rong biển Seasol kích thích bộ rễ phát triển sâu rộng trong túi giá thể',
                'performed_by' => $adminUserId,
                'material_id' => $materialBioGrow ? $materialBioGrow->id : null,
                'material_lot_number' => 'LOT-SEASOL-2025',
                'material_export_slip_code' => 'PXK-HTX-0045',
                'quantity_applied' => 5.0,
                'unit' => 'lít',
                'phi_days' => 0,
            ],
            [
                'crop_season_id' => $season->id,
                'plot_id' => $mainPlot->id,
                'activity_type' => 'FERTILIZATION',
                'fertigation_method' => 'FOLIAR',
                'ec_solution' => 1.2,
                'ec_drain' => null,
                'ph_solution' => 6.2,
                'activity_date' => '2025-12-28',
                'description' => 'Phun phân bón lá Canxi Bo nano chống rụng hoa và nứt quả non lúc trời mát sáng sớm',
                'performed_by' => $adminUserId,
                'material_lot_number' => 'LOT-CABO-2025',
                'material_export_slip_code' => 'PXK-HTX-0048',
                'quantity_applied' => 2.0,
                'unit' => 'lít',
                'phi_days' => 0,
            ],

            // Tab 3: Sổ Dịch hại (IPM), Thiên địch & Thuốc BVTV
            [
                'crop_season_id' => $season->id,
                'plot_id' => $mainPlot->id,
                'activity_type' => 'IPM_SCOUTING',
                'pest_target' => 'Bọ trĩ (Frankliniella occidentalis) & Nhện đỏ',
                'pest_density' => 'KHÔNG_PHÁT_HIỆN',
                'activity_date' => '2025-11-22',
                'description' => 'Điều tra định kỳ 5 điểm chéo góc theo quy chuẩn VietGAP: Sạch sâu bệnh, không phát hiện bọ trĩ',
                'performed_by' => $adminUserId,
                'phi_days' => 0,
            ],
            [
                'crop_season_id' => $season->id,
                'plot_id' => $mainPlot->id,
                'activity_type' => 'BIOCONTROL',
                'biocontrol_agent_name' => 'Amblyseius swirskii (Nhện bắt mồi bọ trĩ)',
                'biocontrol_release_rate' => '10 con/m² (Tổng 20.000 con/nhà màng)',
                'activity_date' => '2025-11-25',
                'description' => 'Thả thiên địch sinh học Amblyseius swirskii kiểm soát tự nhiên bọ trĩ và bọ phấn. Tuân thủ nghiêm ngặt quy tắc ngưng thuốc hóa học ít nhất 21 ngày',
                'performed_by' => $adminUserId,
                'phi_days' => 0,
            ],
            [
                'crop_season_id' => $season->id,
                'plot_id' => $mainPlot->id,
                'activity_type' => 'IPM_SCOUTING',
                'pest_target' => 'Bọ trĩ & Sâu xanh đục quả',
                'pest_density' => '0.3 con/lá (Dưới ngưỡng phòng trừ)',
                'activity_date' => '2025-12-10',
                'description' => 'Kiểm tra mật độ sâu hại sau 15 ngày thả thiên địch: Quần thể bọ săn mồi phát triển cực tốt, khống chế hoàn toàn bọ trĩ',
                'performed_by' => $adminUserId,
                'phi_days' => 0,
            ],
            [
                'crop_season_id' => $season->id,
                'plot_id' => $mainPlot->id,
                'activity_type' => 'SPRAYING',
                'pest_target' => 'Bọ trĩ cục bộ đầu luống',
                'pest_density' => '2.5 con/hoa (Vượt ngưỡng 2 con/hoa)',
                'active_ingredient' => 'Spinetoram 60g/L',
                'resistance_group' => 'IRAC 5 (Spinosyns)',
                'material_lot_number' => 'LOT-RAD-2512',
                'material_export_slip_code' => 'PXK-HTX-0058',
                'activity_date' => '2025-12-25',
                'description' => 'Phun thuốc sinh học Radiant 60SC (Spinetoram) xử lý bọ trĩ vượt ngưỡng phòng trừ theo quy tắc 4 đúng VietGAP. Phun điểm cục bộ luống số 1 và 2. Bắt buộc cách ly PHI 3 ngày',
                'performed_by' => $adminUserId,
                'material_id' => $materialNeem ? $materialNeem->id : null,
                'quantity_applied' => 100.0,
                'unit' => 'ml',
                'water_volume_liters' => 200.0,
                'phi_days' => 3,
                'is_phi_cleared' => true,
                'gps_latitude' => 11.95150000,
                'gps_longitude' => 108.47120000,
            ],
        ];

        foreach ($sampleLogs as $logData) {
            DB::table('farming_logs')->insert(array_merge([
                'id' => (string) Str::uuid(),
                'attachment_reference' => json_encode([
                    'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ], $logData));
        }

        // 6. Cập nhật và Thêm Harvests chia nhiều đợt hái rải vụ chuẩn VietGAP
        DB::table('harvests')->where('crop_season_id', $season->id)->delete();

        $harvestStages = [
            [
                'stage_number' => 1,
                'harvest_date' => '2026-01-10',
                'last_spray_date' => '2025-12-25',
                'last_active_ingredient' => 'Spinetoram 60g/L',
                'days_since_last_spray' => 16,
                'weighing_slip_code' => 'PC-SK-101',
                'quantity' => 1850.0,
                'rejection_weight_kg' => 45.0,
                'grade' => 'GRADE_A',
                'brix_level' => 8.5,
                'uniformity_rate' => 94.0,
            ],
            [
                'stage_number' => 2,
                'harvest_date' => '2026-01-25',
                'last_spray_date' => '2025-12-25',
                'last_active_ingredient' => 'Spinetoram 60g/L',
                'days_since_last_spray' => 31,
                'weighing_slip_code' => 'PC-SK-102',
                'quantity' => 2100.0,
                'rejection_weight_kg' => 50.0,
                'grade' => 'GRADE_A',
                'brix_level' => 8.8,
                'uniformity_rate' => 95.5,
            ],
            [
                'stage_number' => 3,
                'harvest_date' => '2026-02-12',
                'last_spray_date' => '2025-12-25',
                'last_active_ingredient' => 'Spinetoram 60g/L',
                'days_since_last_spray' => 49,
                'weighing_slip_code' => 'PC-SK-103',
                'quantity' => 2450.0,
                'rejection_weight_kg' => 60.0,
                'grade' => 'GRADE_A',
                'brix_level' => 9.0,
                'uniformity_rate' => 96.0,
            ],
        ];

        foreach ($harvestStages as $h) {
            DB::table('harvests')->insert([
                'id' => (string) Str::uuid(),
                'crop_season_id' => $season->id,
                'plot_id' => $mainPlot->id,
                'stage_number' => $h['stage_number'],
                'harvest_date' => $h['harvest_date'],
                'last_spray_date' => $h['last_spray_date'],
                'last_active_ingredient' => $h['last_active_ingredient'],
                'days_since_last_spray' => $h['days_since_last_spray'],
                'weighing_slip_code' => $h['weighing_slip_code'],
                'quantity' => $h['quantity'],
                'rejection_weight_kg' => $h['rejection_weight_kg'],
                'unit' => 'kg',
                'kcs_status' => 'PASSED',
                'kcs_gate_check' => json_encode([
                    'passed' => true,
                    'phi_checked' => true,
                    'safe_harvest_date' => '2025-12-28',
                    'harvest_date' => $h['harvest_date'],
                    'note' => 'Vượt hạn cách ly PHI an toàn ' . ($h['days_since_last_spray'] - 3) . ' ngày',
                ]),
                'grade' => $h['grade'],
                'brix_level' => $h['brix_level'],
                'uniformity_rate' => $h['uniformity_rate'],
                'quality_information' => json_encode([
                    'grade_a_kg' => $h['quantity'] * 0.88,
                    'grade_b_kg' => $h['quantity'] * 0.12,
                    'reject_kg' => $h['rejection_weight_kg'],
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 7. Seed bảng season_material_reconciliations (Cộng sổ cân bằng kho cuối vụ)
        DB::table('season_material_reconciliations')->where('crop_season_id', $season->id)->delete();

        $reconciliationsData = [
            [
                'material_id' => $materialBioGrow ? $materialBioGrow->id : (string)Str::uuid(),
                'material_name' => 'Phân trùn quế hữu cơ Bio-Grow (25kg)',
                'unit' => 'bao_25kg',
                'opening_balance' => 0.0,
                'received_from_coop' => 15.0,
                'used_in_logbook' => 15.0,
                'actual_closing_balance' => 0.0,
                'variance' => 0.0,
                'empty_packaging_returned' => 15,
                'waste_disposal_slip_code' => 'TH-BAOBI-2026-01',
                'reconciliation_notes' => 'Đã đối chiếu 100% vỏ bao bì rỗng với phiếu xuất kho PXK-HTX-0042',
            ],
            [
                'material_id' => $materialHaifa ? $materialHaifa->id : (string)Str::uuid(),
                'material_name' => 'Phân bón vi lượng Haifa Cal-Mag Israel (25kg)',
                'unit' => 'bao_25kg',
                'opening_balance' => 0.0,
                'received_from_coop' => 20.0,
                'used_in_logbook' => 18.0,
                'actual_closing_balance' => 2.0,
                'variance' => 0.0,
                'empty_packaging_returned' => 18,
                'waste_disposal_slip_code' => 'TH-BAOBI-2026-02',
                'reconciliation_notes' => 'Tồn thực tế 2 bao còn nguyên tem niêm phong tại kho hộ xã viên',
            ],
            [
                'material_id' => $materialNeem ? $materialNeem->id : (string)Str::uuid(),
                'material_name' => 'Thuốc BVTV Sinh học Neem Oil 1000EC (Chai 1L)',
                'unit' => 'chai_1L',
                'opening_balance' => 0.0,
                'received_from_coop' => 2.0,
                'used_in_logbook' => 1.0,
                'actual_closing_balance' => 1.0,
                'variance' => 0.0,
                'empty_packaging_returned' => 1,
                'waste_disposal_slip_code' => 'TH-RTH-2026-01',
                'reconciliation_notes' => 'Thu hồi 1 vỏ chai rỗng giao nộp bể chứa rác nguy hại, 1 chai dư hoàn kho HTX niêm phong',
            ],
        ];

        foreach ($reconciliationsData as $rec) {
            DB::table('season_material_reconciliations')->insert(array_merge([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'crop_season_id' => $season->id,
                'status' => 'CONFIRMED',
                'reconciled_by' => $adminUserId,
                'created_at' => $now,
                'updated_at' => $now,
            ], $rec));
        }
    }
}
