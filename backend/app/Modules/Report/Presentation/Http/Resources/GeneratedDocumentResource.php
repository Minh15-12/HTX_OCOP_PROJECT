<?php

namespace Modules\Report\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GeneratedDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'document_type' => $this->document_type,
            'source_entity_type' => $this->source_entity_type,
            'source_entity_id' => $this->source_entity_id,
            'template_version' => $this->template_version,
            'source_data_version' => $this->source_data_version,
            'file_reference' => $this->file_reference,
            'checksum' => $this->checksum,
            'generated_at' => $this->generated_at?->toIso8601String(),
            'download_url' => route('api.documents.download', ['id' => $this->id]),
        ];
    }
}
