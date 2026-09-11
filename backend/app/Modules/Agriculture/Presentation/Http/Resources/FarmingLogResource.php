<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FarmingLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'crop_season_id' => $this->crop_season_id,
            'crop_season_name' => $this->cropSeason?->name,
            'plot_id' => $this->plot_id,
            'plot_code' => $this->plot?->plot_code,
            'activity_type' => $this->activity_type,
            'activity_date' => $this->activity_date?->format('Y-m-d'),
            'description' => $this->description,
            'performed_by' => $this->performed_by,
            'performer_name' => $this->performer?->full_name,
            'attachment_reference' => $this->attachment_reference,
            'material_usages_count' => $this->materialUsages ? $this->materialUsages->count() : 0,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
