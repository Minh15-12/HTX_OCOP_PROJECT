<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CriteriaGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'criteria_version_id' => $this->criteria_version_id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'display_order' => (int) $this->display_order,
            'criteria' => CriterionResource::collection($this->whenLoaded('criteria')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
