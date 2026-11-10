<?php

namespace Modules\Inventory\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarehouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'warehouse_code' => $this->warehouse_code,
            'name' => $this->name,
            'location' => $this->location,
            'manager_id' => $this->manager_id,
            'manager_name' => $this->manager?->full_name,
            'status' => $this->status,
            'receipts_count' => $this->whenCounted('stockReceipts'),
            'issues_count' => $this->whenCounted('stockIssues'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
