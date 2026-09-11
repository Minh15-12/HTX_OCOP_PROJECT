<?php

namespace Modules\Ocop\Dossier\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Cooperative\Presentation\Http\Resources\CooperativeResource;
use Modules\Ocop\Criteria\Presentation\Http\Resources\CriteriaVersionResource;
use Modules\Product\Presentation\Http\Resources\ProductResource;

class ApplicationDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $totalScore = $this->relationLoaded('selfAssessments')
            ? (float) $this->selfAssessments->sum('score')
            : 0.0;

        $assessedCount = $this->relationLoaded('selfAssessments')
            ? $this->selfAssessments->where('status', 'COMPLETED')->count()
            : 0;

        // Calculate progress percentage
        $totalIndicators = 0;
        if ($this->relationLoaded('criteriaVersion') && $this->criteriaVersion) {
            foreach ($this->criteriaVersion->groups as $g) {
                foreach ($g->criteria as $c) {
                    $totalIndicators += $c->indicators->count();
                }
            }
        }

        $progressPercentage = $totalIndicators > 0
            ? round(($assessedCount / $totalIndicators) * 100, 2)
            : 0.0;

        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'product_id' => $this->product_id,
            'criteria_version_id' => $this->criteria_version_id,
            'application_number' => $this->application_number,
            'application_type' => $this->application_type,
            'status' => $this->status,
            'total_self_assessment_score' => $totalScore,
            'progress' => [
                'assessed_indicators' => $assessedCount,
                'total_indicators' => $totalIndicators,
                'percentage' => $progressPercentage,
            ],
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'product' => new ProductResource($this->whenLoaded('product')),
            'cooperative' => new CooperativeResource($this->whenLoaded('cooperative')),
            'criteria_version' => new CriteriaVersionResource($this->whenLoaded('criteriaVersion')),
            'self_assessments' => SelfAssessmentResource::collection($this->whenLoaded('selfAssessments')),
            'reviews' => $this->whenLoaded('reviews'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
