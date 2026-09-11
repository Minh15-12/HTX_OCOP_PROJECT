<?php

namespace Modules\Report\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'report_type' => $this->report_type,
            'filters' => $this->filters,
            'requested_by' => $this->requested_by,
            'status' => $this->status,
            'requested_at' => $this->requested_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'error_message' => $this->error_message,
        ];
    }
}
