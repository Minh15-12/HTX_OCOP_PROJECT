<?php

namespace Modules\Cooperative\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'meeting_id' => $this->meeting_id,
            'user_id' => $this->user_id,
            'voter_name' => $this->user?->full_name,
            'resolution_code' => $this->resolution_code,
            'resolution_type' => $this->resolution_type ?? 'REGULAR',
            'choice' => $this->choice,
            'weight' => (float) $this->weight,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
