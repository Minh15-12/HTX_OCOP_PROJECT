<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductionUnitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'unit_code' => $this->unit_code,
            'name' => $this->name,
            'crop' => $this->crop,
            'area' => (float) $this->area,
            'location' => $this->location,
            'status' => $this->status,
            'registration_information' => $this->registration_information,
            'plots_count' => $this->plots ? $this->plots->count() : 0,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
