<?php

namespace Modules\Ocop\Dossier\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Cooperative\Presentation\Http\Resources\CooperativeResource;
use Modules\Ocop\Criteria\Presentation\Http\Resources\CriteriaVersionResource;
use Modules\Product\Presentation\Http\Resources\ProductResource;

class OcopApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $totalScore = $this->relationLoaded('selfAssessments')
            ? (float) $this->selfAssessments->sum('score')
            : null;

        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'product_id' => $this->product_id,
            'criteria_version_id' => $this->criteria_version_id,
            'application_number' => $this->application_number,
            'application_type' => $this->application_type,
            'status' => $this->status,
            'total_self_assessment_score' => $totalScore,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'product' => new ProductResource($this->whenLoaded('product')),
            'cooperative' => new CooperativeResource($this->whenLoaded('cooperative')),
            'criteria_version' => new CriteriaVersionResource($this->whenLoaded('criteriaVersion')),
            'self_assessments' => SelfAssessmentResource::collection($this->whenLoaded('selfAssessments')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
