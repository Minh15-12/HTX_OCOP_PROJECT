<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CouncilLevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            [
                'id' => (string) Str::uuid(),
                'code' => 'PROVINCE',
                'name' => 'Hội đồng OCOP cấp Tỉnh / Thành phố',
                'description' => 'Đánh giá, phân hạng sản phẩm OCOP cấp Tỉnh (đến 4 sao) theo Quyết định 1489/QĐ-TTg',
                'sort_order' => 1,
                'is_active' => true,
                'valid_from' => '2025-07-06',
            ],
            [
                'id' => (string) Str::uuid(),
                'code' => 'CENTRAL',
                'name' => 'Hội đồng OCOP cấp Trung ương',
                'description' => 'Đánh giá, phân hạng sản phẩm OCOP 5 sao cấp Trung ương theo Quyết định 1489/QĐ-TTg',
                'sort_order' => 2,
                'is_active' => true,
                'valid_from' => '2025-07-06',
            ],
        ];

        foreach ($levels as $level) {
            DB::table('council_levels')->updateOrInsert(
                ['code' => $level['code']],
                [
                    'id' => $level['id'],
                    'name' => $level['name'],
                    'description' => $level['description'],
                    'sort_order' => $level['sort_order'],
                    'is_active' => $level['is_active'],
                    'valid_from' => $level['valid_from'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
