<?php

namespace Modules\Inventory\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberToolTrackingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'member_id' => $this->member_id,
            'member_name' => $this->member?->identity_information['full_name'] ?? ('Xã viên '.($this->member?->member_code ?? '')),
            'member_code' => $this->member?->member_code,
            'material_id' => $this->material_id,
            'material_name' => $this->material?->name,
            'material_code' => $this->material?->sku,
            'farm_plot_id' => $this->farm_plot_id,
            'farm_plot_name' => $this->plot?->plot_code ? 'Nhà màng '.$this->plot->plot_code : 'Vùng trồng chính',
            'serial_number' => $this->serial_number,
            'quantity' => (int) $this->quantity,
            'status' => $this->status,
            'assigned_date' => $this->assigned_date?->format('Y-m-d') ?? (string) $this->assigned_date,
            'returned_date' => $this->returned_date?->format('Y-m-d') ?? ($this->returned_date ? (string) $this->returned_date : null),
            'note' => $this->note,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
