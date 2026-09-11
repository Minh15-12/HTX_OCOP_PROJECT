<?php

namespace Modules\Ocop\Evidence\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Identity\Presentation\Http\Resources\UserResource;
use Modules\Ocop\Criteria\Presentation\Http\Resources\IndicatorResource;

class EvidenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'title' => $this->title,
            'evidence_type' => $this->evidence_type,
            'source_type' => $this->source_type,
            'status' => $this->status,
            'current_version_id' => $this->current_version_id,
            'current_version' => new EvidenceVersionResource($this->whenLoaded('currentVersion')),
            'indicators' => IndicatorResource::collection($this->whenLoaded('indicators')),
            'verified_by' => $this->verified_by,
            'verified_user' => new UserResource($this->whenLoaded('verifiedUser')),
            'verified_at' => $this->verified_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
