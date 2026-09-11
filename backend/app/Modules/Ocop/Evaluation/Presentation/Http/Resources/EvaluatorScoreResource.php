<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluatorScoreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assignment_id' => $this->assignment_id,
            'indicator_id' => $this->indicator_id,
            'score' => (float) $this->score,
            'comment' => $this->comment,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'locked_at' => $this->locked_at?->toIso8601String(),
            'indicator' => $this->whenLoaded('indicator', fn () => [
                'id' => $this->indicator->id,
                'code' => $this->indicator->code ?? null,
                'name' => $this->indicator->name ?? null,
                'max_score' => (float) ($this->indicator->max_score ?? 0),
                'is_mandatory' => (bool) ($this->indicator->is_mandatory ?? false),
            ]),
        ];
    }
}
