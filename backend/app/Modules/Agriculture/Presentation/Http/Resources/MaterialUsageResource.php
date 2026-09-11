<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialUsageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'farming_log_id' => $this->farming_log_id,
            'material_id' => $this->material_id,
            'material_name' => $this->material?->name,
            'material_sku' => $this->material?->sku,
            'quantity' => (float) $this->quantity,
            'unit' => $this->unit,
            'batch_reference' => $this->batch_reference,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
