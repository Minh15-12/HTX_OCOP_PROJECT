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
            'lot_id' => $this->lot_id,
            'lot_code' => $this->lot?->lot_code,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
