<?php

namespace Modules\Cooperative\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MeetingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'meeting_type' => $this->meeting_type,
            'meeting_date' => $this->meeting_date?->format('Y-m-d'),
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'votes_count' => $this->whenCounted('votes'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
