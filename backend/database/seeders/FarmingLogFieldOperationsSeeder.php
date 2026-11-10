<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogItemModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class FarmingLogFieldOperationsSeeder extends Seeder
{
    public function run(): void
    {
        $season = CropSeasonModel::where('name', 'like', '%Đông Xuân%')->first()
            ?? CropSeasonModel::first();

        if (!$season) {
            $this->command->warn('Không tìm thấy mùa vụ nào để seed nhật ký canh tác.');
            return;
        }

        $plots = FarmPlotModel::where('production_unit_id', $season->production_unit_id)->get();
        if ($plots->isEmpty()) {
            $plots = FarmPlotModel::all();
        }

        $admin = UserModel::where('username', 'admin_htx')->first() ?? UserModel::first();

        // 1. Nhật ký Tưới phân nhỏ giọt Fertigation Công nghệ cao (EC 2.2, pH 6.0)
        $plot1 = $plots->first();
        if ($plot1) {
            $log1Id = (string) Str::uuid();
            $log1 = FarmingLogModel::create([
                'id' => $log1Id,
                'crop_season_id' => $season->id,
                'plot_id' => $plot1->id,
                'activity_type' => 'FERTILIZING',
                'fertigation_method' => 'DRIP_EMITTER',
                'ec_solution' => 2.20,
                'ec_drain' => 1.15,
                'ph_solution' => 6.00,
                'tank_composition' => [
                    'tank_a' => 'Calcinit (Canxi Nitrat 5kg) + Sắt Chelate Fe-EDDHA (50g)',
                    'tank_b' => 'Krista-K Plus (3kg) + Krista-MAG (2kg) + MKP (2kg) + Vi lượng EDTA',
                ],
                'water_volume_liters' => 3500,
                'application_equipment' => 'Hệ thống que ghim bù áp Netafim Israel',
                'status' => 'VERIFIED',
                'is_backdated' => false,
                'verified_by' => $admin?->id,
                'verified_at' => now(),
                'activity_date' => now()->subDays(2)->format('Y-m-d'),
                'description' => 'Tưới phân nhỏ giọt định kỳ giai đoạn nuôi trái lớn, duy trì EC rễ 1.15, độ ẩm xơ dừa 75%.',
                'performed_by' => $admin?->id,
                'quantity_applied' => 12.0000,
                'unit' => 'kg',
                'phi_days' => 0,
                'gps_latitude' => 11.951500,
                'gps_longitude' => 108.472800,
                'gps_distance_to_edge_meters' => 5.2,
                'is_gps_verified' => true,
                'prev_hash' => str_repeat('0', 64),
                'hash_sha256' => hash('sha256', 'LOG-FERTIGATION-HIGH-TECH-' . $log1Id),
            ]);
        }

        // 2. Nhật ký Phun thuốc phối trộn Tank-Mix (Neem Oil + Trichoderma)
        $plot2 = $plots->skip(1)->first() ?? $plots->first();
        if ($plot2) {
            $log2Id = (string) Str::uuid();
            $log2 = FarmingLogModel::create([
                'id' => $log2Id,
                'crop_season_id' => $season->id,
                'plot_id' => $plot2->id,
                'activity_type' => 'SPRAYING',
                'application_equipment' => 'Bình phun áp lực cao béc sương mịn',
                'water_volume_liters' => 400,
                'status' => 'VERIFIED',
                'is_backdated' => false,
                'verified_by' => $admin?->id,
                'verified_at' => now(),
                'activity_date' => now()->subDays(5)->format('Y-m-d'),
                'description' => 'Phun phòng trừ bọ trĩ và nấm rễ bằng giải pháp sinh học phối trộn Tank-Mix.',
                'performed_by' => $admin?->id,
                'phi_days' => 3,
                'gps_latitude' => 11.952000,
                'gps_longitude' => 108.473500,
                'gps_distance_to_edge_meters' => 0.0,
                'is_gps_verified' => true,
                'prev_hash' => hash('sha256', 'LOG-FERTIGATION-HIGH-TECH-' . ($log1Id ?? '1')),
                'hash_sha256' => hash('sha256', 'LOG-TANK-MIX-SPRAYING-' . $log2Id),
            ]);

            // Item 1 trong Tank-Mix: Neem Oil sinh học
            FarmingLogItemModel::create([
                'id' => (string) Str::uuid(),
                'farming_log_id' => $log2->id,
                'material_name' => 'Thuốc BVTV Sinh học Neem Oil 1000EC',
                'item_type' => 'PESTICIDE',
                'active_ingredient' => 'Azadirachtin 0.3%',
                'resistance_group' => 'IRAC UN (Sinh học)',
                'quantity_applied' => 1.5,
                'unit' => 'Lít',
                'phi_days' => 3,
                'material_lot_number' => 'LOT-NEEM-2026-01',
                'material_export_slip_code' => 'PXK-2026-11-03',
            ]);

            // Item 2 trong Tank-Mix: Nấm đối kháng Trichoderma
            FarmingLogItemModel::create([
                'id' => (string) Str::uuid(),
                'farming_log_id' => $log2->id,
                'material_name' => 'Chế phẩm Nấm Đối kháng Trichoderma Bio-VT (1kg)',
                'item_type' => 'BIOCONTROL',
                'active_ingredient' => 'Trichoderma viride 10^9 CFU/g',
                'resistance_group' => 'Sinh học Đối kháng',
                'quantity_applied' => 2.0,
                'unit' => 'Gói 1kg',
                'phi_days' => 0,
                'material_lot_number' => 'LOT-TRICHO-2026-05',
                'material_export_slip_code' => 'PXK-2026-11-04',
            ]);

            // PHI Calculation
            $neemMaterial = MaterialModel::where('name', 'like', '%Neem Oil%')->first() ?? MaterialModel::first();
            PhiCalculationModel::create([
                'id' => (string) Str::uuid(),
                'farming_log_id' => $log2->id,
                'material_id' => $neemMaterial?->id,
                'application_date' => now()->subDays(5)->format('Y-m-d'),
                'configured_phi_days' => 3,
                'safety_date' => now()->subDays(2)->format('Y-m-d'),
                'status' => 'COMPLETED',
                'source_reference' => ['source' => 'TANK_MIX_LOG'],
            ]);
        }

        // 3. Nhật ký Thả thiên địch sinh học IPM & Treo bẫy dính
        $plot3 = $plots->skip(2)->first() ?? $plots->first();
        if ($plot3) {
            $log3Id = (string) Str::uuid();
            FarmingLogModel::create([
                'id' => $log3Id,
                'crop_season_id' => $season->id,
                'plot_id' => $plot3->id,
                'activity_type' => 'BIOCONTROL',
                'pest_target' => 'Bọ trĩ (Frankliniella occidentalis)',
                'pest_density' => '2-3 con/ngọn (Ngưỡng an toàn)',
                'biocontrol_agent_name' => 'Bọ xít bắt mồi Orius laevigatus',
                'biocontrol_release_rate' => '2 con/m2 (Tổng cộng 7.000 con)',
                'status' => 'VERIFIED',
                'is_backdated' => false,
                'verified_by' => $admin?->id,
                'verified_at' => now(),
                'activity_date' => now()->subDays(8)->format('Y-m-d'),
                'description' => 'Phóng thả thiên địch bọ xít Orius kết hợp treo 40 bẫy dính màu vàng/xanh trong nhà màng.',
                'performed_by' => $admin?->id,
                'quantity_applied' => 7000,
                'unit' => 'Con',
                'phi_days' => 0,
                'gps_latitude' => 11.951800,
                'gps_longitude' => 108.473200,
                'gps_distance_to_edge_meters' => 2.1,
                'is_gps_verified' => true,
                'prev_hash' => hash('sha256', 'LOG-TANK-MIX-SPRAYING-' . ($log2Id ?? '2')),
                'hash_sha256' => hash('sha256', 'LOG-BIOCONTROL-IPM-' . $log3Id),
            ]);
        }

        // 4. Nhật ký Ghi lùi ngày chờ thẩm định ICS (Chờ duyệt - Maker-Checker workflow)
        $plot4 = $plots->skip(3)->first() ?? $plots->first();
        if ($plot4) {
            $log4Id = (string) Str::uuid();
            FarmingLogModel::create([
                'id' => $log4Id,
                'crop_season_id' => $season->id,
                'plot_id' => $plot4->id,
                'activity_type' => 'CARE',
                'status' => 'SUBMITTED',
                'is_backdated' => true, // Ghi lùi ngày > 48h
                'activity_date' => now()->subDays(4)->format('Y-m-d'),
                'description' => 'Tỉa cành tạo tán chữ Y và quấn dây đỡ thân ớt chuông đợt 2 (Ghi nhận bằng giọng nói ngoài ruộng).',
                'voice_raw_text' => 'Tỉa cành tạo tán chữ Y và quấn dây đỡ thân ớt chuông đợt hai',
                'performed_by' => $admin?->id,
                'phi_days' => 0,
                'gps_latitude' => 11.952500,
                'gps_longitude' => 108.474000,
                'gps_distance_to_edge_meters' => 12.5,
                'is_gps_verified' => true,
                'prev_hash' => hash('sha256', 'LOG-BIOCONTROL-IPM-' . ($log3Id ?? '3')),
                'hash_sha256' => hash('sha256', 'LOG-CARE-BACKDATED-' . $log4Id),
            ]);
        }

        $this->command->info('Đã seed thành công 4 bản ghi nhật ký tác nghiệp ngoài đồng (Fertigation, Tank-Mix, Biocontrol, Backdated ICS).');
    }
}
