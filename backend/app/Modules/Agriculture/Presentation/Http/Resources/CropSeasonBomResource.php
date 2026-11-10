<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CropSeasonBomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'crop_season_id' => $this->crop_season_id,
            'material_id' => $this->material_id,
            'material_name' => $this->material?->name,
            'sku' => $this->material?->sku,
            'unit' => $this->material?->unit,
            'category' => $this->material?->category,
            'stage_phase' => $this->stage_phase,
            'standard_rate_per_sqm' => (float) $this->standard_rate_per_sqm,
            'planned_quantity' => (float) $this->planned_quantity,
            'issued_quantity' => (float) $this->issued_quantity,
            'estimated_unit_price' => (float) $this->estimated_unit_price,
            'estimated_total_cost' => (float) $this->estimated_total_cost,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
