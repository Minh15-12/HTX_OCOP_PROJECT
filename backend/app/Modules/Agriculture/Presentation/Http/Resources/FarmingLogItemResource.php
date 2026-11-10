<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FarmingLogItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'farming_log_id' => $this->farming_log_id,
            'material_id' => $this->material_id,
            'material_name' => $this->material_name,
            'item_type' => $this->item_type,
            'active_ingredient' => $this->active_ingredient,
            'resistance_group' => $this->resistance_group,
            'quantity_applied' => (float) $this->quantity_applied,
            'unit' => $this->unit,
            'phi_days' => (int) $this->phi_days,
            'material_lot_number' => $this->material_lot_number,
            'material_export_slip_code' => $this->material_export_slip_code,
        ];
    }
}
