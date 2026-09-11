<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CriteriaVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'version_code' => $this->version_code,
            'name' => $this->name,
            'effective_from' => $this->effective_from?->format('Y-m-d'),
            'effective_to' => $this->effective_to?->format('Y-m-d'),
            'source_reference' => $this->source_reference,
            'status' => $this->status,
            'groups' => CriteriaGroupResource::collection($this->whenLoaded('groups')),
            'scoring_rules' => $this->whenLoaded('scoringRules'),
            'mandatory_conditions' => $this->whenLoaded('mandatoryConditions'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
