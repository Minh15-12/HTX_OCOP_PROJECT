<?php

namespace Modules\Ocop\Dossier\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Ocop\Criteria\Presentation\Http\Resources\IndicatorResource;

class SelfAssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'indicator_id' => $this->indicator_id,
            'score' => (float) $this->score,
            'explanation' => $this->explanation,
            'status' => $this->status,
            'indicator' => new IndicatorResource($this->whenLoaded('indicator')),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
