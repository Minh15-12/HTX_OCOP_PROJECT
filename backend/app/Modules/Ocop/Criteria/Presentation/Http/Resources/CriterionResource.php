<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CriterionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'criteria_group_id' => $this->criteria_group_id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'max_score' => (float) $this->max_score,
            'mandatory' => (bool) $this->mandatory,
            'display_order' => (int) $this->display_order,
            'indicators' => IndicatorResource::collection($this->whenLoaded('indicators')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
