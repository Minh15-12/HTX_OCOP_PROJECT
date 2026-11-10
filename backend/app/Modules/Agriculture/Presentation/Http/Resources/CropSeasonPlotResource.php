<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CropSeasonPlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $memberName = $this->member?->user?->full_name 
            ?? $this->member?->identity_information['full_name'] 
            ?? null;

        $memberPhone = $this->member?->user?->phone_number 
            ?? $this->member?->identity_information['phone'] 
            ?? null;

        return [
            'id' => $this->id,
            'crop_season_id' => $this->crop_season_id,
            'plot_id' => $this->plot_id,
            'plot_code' => $this->plot?->plot_code,
            'plot_area' => $this->plot?->area ? (float) $this->plot->area : null,
            'plot_status' => $this->plot?->status,
            'plot_quarantine_until' => $this->plot?->quarantine_until?->format('Y-m-d'),
            'member_id' => $this->member_id,
            'member_code' => $this->member?->member_code,
            'member_name' => $memberName,
            'member_phone' => $memberPhone,
            'allocated_area' => (float) $this->allocated_area,
            'crop_variety' => $this->crop_variety,
            'planting_date' => $this->planting_date?->format('Y-m-d'),
            'expected_harvest_start' => $this->expected_harvest_start?->format('Y-m-d'),
            'expected_harvest_end' => $this->expected_harvest_end?->format('Y-m-d'),
            'target_yield_kg' => (float) $this->target_yield_kg,
            'actual_harvested_kg' => (float) $this->actual_harvested_kg,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
