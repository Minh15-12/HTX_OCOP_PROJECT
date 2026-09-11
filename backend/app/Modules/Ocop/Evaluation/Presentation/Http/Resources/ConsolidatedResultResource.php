<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsolidatedResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'evaluation_session_id' => $this->evaluation_session_id,
            'total_score' => (float) $this->total_score,
            'rule_version_reference' => $this->rule_version_reference,
            'consolidation_status' => $this->consolidation_status,
            'calculated_at' => $this->calculated_at?->toIso8601String(),
            'proposed_classification' => new ProposedClassificationResource($this->whenLoaded('proposedClassification')),
        ];
    }
}
