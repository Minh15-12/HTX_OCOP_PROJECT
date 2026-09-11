<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lot_code' => $this->lot_code,
            'harvest_id' => $this->harvest_id,
            'harvest_date' => $this->harvest?->harvest_date?->format('Y-m-d'),
            'quantity' => (float) $this->quantity,
            'unit' => $this->unit,
            'status' => $this->status,
            'source_information' => $this->source_information,
            'season_name' => $this->harvest?->cropSeason?->name,
            'plot_code' => $this->harvest?->plot?->plot_code,
            'unit_code' => $this->harvest?->cropSeason?->productionUnit?->unit_code,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
