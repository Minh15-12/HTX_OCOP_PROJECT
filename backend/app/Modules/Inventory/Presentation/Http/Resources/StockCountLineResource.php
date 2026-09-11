<?php

namespace Modules\Inventory\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockCountLineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'stock_count_id' => $this->stock_count_id,
            'material_id' => $this->material_id,
            'material_name' => $this->material?->name,
            'material_sku' => $this->material?->sku,
            'expected_quantity' => (float) $this->expected_quantity,
            'actual_quantity' => (float) $this->actual_quantity,
            'difference' => (float) $this->difference,
            'reason' => $this->reason,
        ];
    }
}
