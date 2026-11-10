<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CropSeasonPlotAndBomSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tìm mùa vụ Ớt chuông Sweet Palermo đang canh tác (loại trừ các vụ lịch sử đã quyết toán)
        $season = DB::table('crop_seasons')
            ->where(function ($q) {
                $q->where('status', 'IN_PROGRESS')
                    ->orWhere('status', 'ACTIVE');
            })
            ->where('name', 'NOT LIKE', '%Đã Quyết Toán%')
            ->first();

        if (!$season) {
            $season = DB::table('crop_seasons')
                ->where('name', 'NOT LIKE', '%Đã Quyết Toán%')
                ->where('status', '!=', 'COMPLETED')
                ->first();
        }

        if (!$season) {
            return;
        }

        // Cập nhật hợp đồng bao tiêu và quy chuẩn cây giống chuẩn VietGAP
        DB::table('crop_seasons')->where('id', $season->id)->update([
            'status' => 'ACTIVE',
            'buyer_contract_info' => json_encode([
                'buyer_name' => 'Hệ thống Siêu thị WinMart & Bách Hóa Xanh',
                'contract_code' => 'HD-2025-PALERMO-01',
                'phc_code' => 'PHC-LAMDONG-042',
                'contract_volume_kg' => 45000,
                'target_volume_kg' => 45000,
                'committed_price_per_kg' => 65000,
            ], JSON_UNESCAPED_UNICODE),
            'puc_quota_kg' => 50000.00,
            'seed_supplier' => 'Rijk Zwaan Hà Lan (Hạt giống F1 nhập khẩu chính ngạch)',
            'seedling_standard_checklist' => json_encode([
                'seedling_age_days' => 28,
                'true_leaves_count' => '4 - 5 lá thật',
                'root_condition' => 'Rễ trắng khỏe, bầu rễ không vỡ nát',
                'pest_free_verified' => true,
                'vietgap_certified' => true,
            ], JSON_UNESCAPED_UNICODE),
            'plan_information' => json_encode([
                'stages' => [
                    [
                        'stage_number' => 1,
                        'name' => 'Ươm cây con & Bén rễ',
                        'duration_days' => 30,
                        'description' => 'Gieo hạt, kích thích hệ rễ phát triển, tưới dung dịch dinh dưỡng loãng EC 1.2 mS/cm, phòng trừ lở cổ rễ.',
                    ],
                    [
                        'stage_number' => 2,
                        'name' => 'Sinh dưỡng thân lá & Phân hóa mầm hoa',
                        'duration_days' => 45,
                        'description' => 'Tỉa cành tạo tán chữ Y, giăng dây đỡ cây, tăng cường đạm và lân, điều hòa EC dung dịch tưới 1.8 - 2.0 mS/cm.',
                    ],
                    [
                        'stage_number' => 3,
                        'name' => 'Đậu trái & Nuôi quả lớn (Tăng độ Brix)',
                        'duration_days' => 30,
                        'description' => 'Bón bổ sung Canxi-Bo chống nứt trái, bổ sung Kali Sunfat để đạt độ ngọt Brix ≥ 7.0°, thả thiên địch bọ xít Orius diệt bọ trĩ.',
                    ],
                    [
                        'stage_number' => 4,
                        'name' => 'Thu hoạch rộ định kỳ & Kiểm soát PHI',
                        'duration_days' => 195,
                        'description' => 'Cắt trái 5 - 7 ngày/lần, kiểm định cảm quan Grade A, nghiêm ngặt tuân thủ thời gian cách ly PHI trước ngày thu hoạch.',
                    ],
                ],
            ], JSON_UNESCAPED_UNICODE),
        ]);

        // 2. Lấy danh sách thành viên và thửa đất cùng vùng sản xuất
        $plots = DB::table('farm_plots')
            ->where('production_unit_id', $season->production_unit_id)
            ->get();

        $members = DB::table('members')->get();

        if ($plots->isNotEmpty()) {
            DB::table('crop_season_plots')->where('crop_season_id', $season->id)->delete();

            // Phân bổ rải vụ so le lệch nhau 14 ngày (Staggered Planting)
            $staggerConfig = [
                0 => ['offset_days' => 0, 'variety' => 'Sweet Palermo Đỏ F1', 'status' => 'HARVESTING', 'actual_rate' => 0.80],
                1 => ['offset_days' => 14, 'variety' => 'Sweet Palermo Đỏ F1', 'status' => 'HARVESTING', 'actual_rate' => 0.55],
                2 => ['offset_days' => 28, 'variety' => 'Sweet Palermo Vàng F1', 'status' => 'GROWING', 'actual_rate' => 0.20],
                3 => ['offset_days' => 42, 'variety' => 'Sweet Palermo Cam F1', 'status' => 'PLANTED', 'actual_rate' => 0.00],
            ];

            foreach ($plots->take(4) as $idx => $plot) {
                $member = $members[$idx % $members->count()] ?? null;
                $cfg = $staggerConfig[$idx] ?? ['offset_days' => 0, 'variety' => 'Sweet Palermo Đỏ F1', 'status' => 'GROWING', 'actual_rate' => 0.3];

                $area = (float) $plot->area;
                $areaM2 = $area < 100 ? $area * 10000 : $area;
                $targetYield = round($areaM2 * 4.5, 2); // 4.5 kg/m2
                $actualHarvested = round($targetYield * $cfg['actual_rate'], 2);

                $plantingDate = date('Y-m-d', strtotime($season->start_date." + {$cfg['offset_days']} days"));
                $harvestStart = date('Y-m-d', strtotime($plantingDate.' + 75 days'));
                $harvestEnd = $season->expected_end_date;

                DB::table('crop_season_plots')->insert([
                    'id' => (string) Str::uuid(),
                    'crop_season_id' => $season->id,
                    'plot_id' => $plot->id,
                    'member_id' => $member?->id,
                    'allocated_area' => $areaM2,
                    'crop_variety' => $cfg['variety'],
                    'planting_date' => $plantingDate,
                    'expected_harvest_start' => $harvestStart,
                    'expected_harvest_end' => $harvestEnd,
                    'target_yield_kg' => $targetYield,
                    'actual_harvested_kg' => $actualHarvested,
                    'status' => $cfg['status'],
                    'notes' => 'Rải vụ so le đợt '.($idx + 1).' theo cam kết giao hàng chuỗi siêu thị WinMart.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 3. Phân bổ Bảng Dự toán Định mức Vật tư Đầu vào (BOM)
        $materials = DB::table('materials')->get()->keyBy('sku');
        if ($materials->isNotEmpty()) {
            DB::table('crop_season_boms')->where('crop_season_id', $season->id)->delete();

            $bomDefinitions = [
                [
                    'sku' => 'MAT-PHAN-01', // Phân trùn quế Bio-Grow
                    'phase' => 'SEEDLING',
                    'rate' => 0.02, // 0.02 bao/m2
                    'planned_qty' => 280,
                    'issued_qty' => 280,
                    'price' => 180000,
                    'notes' => 'Bón lót cải tạo đất và giá thể trước khi xuống giống',
                ],
                [
                    'sku' => 'MAT-PHAN-02', // Phân bón vi lượng Haifa Cal-Mag
                    'phase' => 'FRUITING',
                    'rate' => 0.008,
                    'planned_qty' => 110,
                    'issued_qty' => 95,
                    'price' => 850000,
                    'notes' => 'Tưới nhỏ giọt fertigation hàng ngày, bổ sung Canxi-Magiê chống nứt quả',
                ],
                [
                    'sku' => 'MAT-PHAN-03', // Seasol Australia 5L
                    'phase' => 'VEGETATIVE',
                    'rate' => 0.003,
                    'planned_qty' => 45,
                    'issued_qty' => 40,
                    'price' => 620000,
                    'notes' => 'Phun qua lá kích rễ và đâm chồi ngọn tuần 3 đến tuần 8',
                ],
                [
                    'sku' => 'MAT-BVTV-01', // Neem Oil 1L
                    'phase' => 'FRUITING',
                    'rate' => 0.004,
                    'planned_qty' => 55,
                    'issued_qty' => 45,
                    'price' => 280000,
                    'notes' => 'Phòng trừ bọ trĩ và rệp muội sinh học, cách ly PHI 3 ngày',
                ],
                [
                    'sku' => 'MAT-BVTV-02', // Trichoderma 1kg
                    'phase' => 'SEEDLING',
                    'rate' => 0.005,
                    'planned_qty' => 70,
                    'issued_qty' => 70,
                    'price' => 95000,
                    'notes' => 'Xử lý nấm đối kháng phòng bệnh héo rũ gốc mốc trắng',
                ],
            ];

            foreach ($bomDefinitions as $def) {
                if (isset($materials[$def['sku']])) {
                    $mat = $materials[$def['sku']];
                    $totalCost = $def['planned_qty'] * $def['price'];

                    DB::table('crop_season_boms')->insert([
                        'id' => (string) Str::uuid(),
                        'crop_season_id' => $season->id,
                        'material_id' => $mat->id,
                        'stage_phase' => $def['phase'],
                        'standard_rate_per_sqm' => $def['rate'],
                        'planned_quantity' => $def['planned_qty'],
                        'issued_quantity' => $def['issued_qty'],
                        'estimated_unit_price' => $def['price'],
                        'estimated_total_cost' => $totalCost,
                        'notes' => $def['notes'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
