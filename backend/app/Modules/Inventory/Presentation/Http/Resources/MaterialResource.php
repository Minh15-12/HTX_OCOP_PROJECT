<?php

namespace Modules\Inventory\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Inventory\Application\Services\MaterialService;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var MaterialService $service */
        $service = app(MaterialService::class);
        $availableStock = $service->calculateAvailableStock($this->id);

        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'sku' => $this->sku,
            'name' => $this->name,
            'category' => $this->category,
            'unit' => $this->unit,
            'safety_information' => $this->safety_information,
            'reorder_threshold' => (float) $this->reorder_threshold,
            'available_stock' => $availableStock,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
