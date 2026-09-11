<?php

namespace Modules\Inventory\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockReceiptLineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'stock_receipt_id' => $this->stock_receipt_id,
            'material_id' => $this->material_id,
            'material_name' => $this->material?->name,
            'material_sku' => $this->material?->sku,
            'quantity' => (float) $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'line_amount' => (float) $this->line_amount,
            'batch_code' => $this->batch_code,
            'expiry_date' => $this->expiry_date?->format('Y-m-d'),
        ];
    }
}
