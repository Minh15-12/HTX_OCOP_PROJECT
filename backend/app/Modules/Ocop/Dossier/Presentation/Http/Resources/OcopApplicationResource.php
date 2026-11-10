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

        $decision = $this->relationLoaded('finalDecision') ? $this->finalDecision : null;
        $starRating = 0;
        if ($decision) {
            $starRating = match ($decision->final_classification) {
                'FIVE_STAR' => 5,
                'FOUR_STAR' => 4,
                'THREE_STAR' => 3,
                default => 0,
            };
        }

        $targetStar = 4;
        if ($totalScore !== null) {
            if ($totalScore >= 90.0) {
                $targetStar = 5;
            } elseif ($totalScore >= 70.0) {
                $targetStar = 4;
            } elseif ($totalScore >= 50.0) {
                $targetStar = 3;
            }
        }

        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'product_id' => $this->product_id,
            'criteria_version_id' => $this->criteria_version_id,
            'application_number' => $this->application_number,
            'application_type' => $this->application_type,
            'status' => $this->status,
            'target_star' => $targetStar,
            'star_rating' => $starRating,
            'total_self_assessment_score' => $totalScore,
            'decision_number' => $decision?->decision_number,
            'decision_date' => $decision?->decision_date?->format('Y-m-d'),
            'effective_date' => $decision?->effective_date?->format('Y-m-d'),
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
