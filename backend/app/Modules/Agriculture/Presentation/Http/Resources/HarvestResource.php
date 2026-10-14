<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HarvestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'crop_season_id' => $this->crop_season_id,
            'season_name' => $this->cropSeason?->name,
            'plot_id' => $this->plot_id,
            'plot_code' => $this->plot?->plot_code,
            'harvest_date' => $this->harvest_date?->format('Y-m-d'),
            'quantity' => (float) $this->quantity,
            'unit' => $this->unit,
            'quality_information' => $this->quality_information,
            'kcs_status' => $this->kcs_status ?? 'PENDING_KCS',
            'kcs_gate_check' => $this->kcs_gate_check,
            'kcs_quick_lab' => $this->kcs_quick_lab,
            'grade' => $this->grade ?? 'GRADE_B',
            'grade_a_kg' => (float) $this->grade_a_kg,
            'grade_b_kg' => (float) $this->grade_b_kg,
            'reject_kg' => (float) $this->reject_kg,
            'brix_level' => $this->brix_level ? (float) $this->brix_level : null,
            'uniformity_rate' => $this->uniformity_rate ? (float) $this->uniformity_rate : null,
            'lot_id' => $this->lot_id,
            'lot_code' => $this->lot?->lot_code,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
