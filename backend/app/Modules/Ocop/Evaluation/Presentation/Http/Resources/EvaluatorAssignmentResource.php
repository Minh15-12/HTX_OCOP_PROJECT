<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluatorAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'evaluation_session_id' => $this->evaluation_session_id,
            'evaluator_id' => $this->evaluator_id,
            'role' => $this->role,
            'status' => $this->status,
            'assigned_at' => $this->assigned_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'evaluator' => $this->whenLoaded('evaluator', fn () => [
                'id' => $this->evaluator->id,
                'name' => $this->evaluator->name ?? null,
                'email' => $this->evaluator->email ?? null,
            ]),
            'scores' => EvaluatorScoreResource::collection($this->whenLoaded('scores')),
        ];
    }
}
