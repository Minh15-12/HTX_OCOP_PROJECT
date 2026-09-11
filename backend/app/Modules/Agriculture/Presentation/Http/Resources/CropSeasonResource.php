<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CropSeasonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'production_unit_id' => $this->production_unit_id,
            'unit_code' => $this->productionUnit?->unit_code,
            'unit_name' => $this->productionUnit?->name,
            'name' => $this->name,
            'crop' => $this->crop,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'expected_end_date' => $this->expected_end_date?->format('Y-m-d'),
            'actual_end_date' => $this->actual_end_date?->format('Y-m-d'),
            'status' => $this->status,
            'plan_information' => $this->plan_information,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
