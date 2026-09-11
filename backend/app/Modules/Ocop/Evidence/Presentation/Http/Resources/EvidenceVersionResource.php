<?php

namespace Modules\Ocop\Evidence\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Identity\Presentation\Http\Resources\UserResource;

class EvidenceVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'evidence_id' => $this->evidence_id,
            'version_number' => (int) $this->version_number,
            'file_name' => $this->file_name,
            'checksum' => $this->checksum,
            'mime_type' => $this->mime_type,
            'file_size' => (int) $this->file_size,
            'replacement_reason' => $this->replacement_reason,
            'uploaded_by' => $this->uploaded_by,
            'uploader' => new UserResource($this->whenLoaded('uploader')),
            'uploaded_at' => $this->uploaded_at?->toIso8601String(),
        ];
    }
}
