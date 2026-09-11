<?php

namespace Modules\Inventory\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockCountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'count_number' => $this->count_number,
            'count_date' => $this->count_date?->format('Y-m-d'),
            'scope' => $this->scope,
            'status' => $this->status,
            'reason' => $this->reason,
            'created_by' => $this->created_by,
            'creator_name' => $this->creator?->full_name,
            'approved_by' => $this->approved_by,
            'approver_name' => $this->approver?->full_name,
            'lines' => StockCountLineResource::collection($this->whenLoaded('lines')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
