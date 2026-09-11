<?php

namespace Modules\Ocop\Criteria\Application\Services;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CouncilLevelModel;

class CouncilLevelService
{
    public function listCouncilLevels(): Collection
    {
        $levels = CouncilLevelModel::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        if ($levels->isEmpty()) {
            $this->seedDefaultCouncilLevels();
            $levels = CouncilLevelModel::where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->get();
        }

        return $levels;
    }

    private function seedDefaultCouncilLevels(): void
    {
        $defaults = [
            [
                'id' => (string) Str::uuid(),
                'code' => 'DISTRICT',
                'name' => 'Hội đồng đánh giá cấp Huyện/Thị xã',
                'description' => 'Đánh giá, phân hạng sản phẩm OCOP cấp huyện (đánh giá 3 sao)',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'code' => 'PROVINCE',
                'name' => 'Hội đồng đánh giá cấp Tỉnh/Thành phố',
                'description' => 'Đánh giá, phân hạng sản phẩm OCOP cấp tỉnh (đánh giá 4 sao)',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'code' => 'CENTRAL',
                'name' => 'Hội đồng đánh giá cấp Trung ương',
                'description' => 'Đánh giá, công nhận sản phẩm OCOP cấp quốc gia (đánh giá 5 sao)',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($defaults as $data) {
            CouncilLevelModel::firstOrCreate(
                ['code' => $data['code']],
                $data
            );
        }
    }
}
