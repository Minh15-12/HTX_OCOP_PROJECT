<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'council_level_id' => $this->council_level_id,
            'status' => $this->status,
            'started_at' => $this->started_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'application' => $this->whenLoaded('application', fn () => [
                'id' => $this->application->id,
                'application_code' => $this->application->application_code ?? null,
                'status' => $this->application->status ?? null,
            ]),
            'council_level' => $this->whenLoaded('councilLevel', fn () => [
                'id' => $this->councilLevel->id,
                'code' => $this->councilLevel->code ?? null,
                'name' => $this->councilLevel->name ?? null,
            ]),
            'assignments' => EvaluatorAssignmentResource::collection($this->whenLoaded('assignments')),
            'consolidated_result' => new ConsolidatedResultResource($this->whenLoaded('consolidatedResult')),
        ];
    }
}
