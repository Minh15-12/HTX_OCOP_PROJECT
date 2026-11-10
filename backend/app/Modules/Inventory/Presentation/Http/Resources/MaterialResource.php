<?php

namespace Modules\Inventory\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Inventory\Application\Services\MaterialService;
use Modules\Inventory\Infrastructure\Persistence\Models\StockReceiptLineModel;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var MaterialService $service */
        $service = app(MaterialService::class);
        $availableStock = $service->calculateAvailableStock($this->id);

        // Resolve unit_price: priority 1: safety_information['unit_price'], priority 2: latest stock receipt line
        $unitPrice = 0.0;
        if (isset($this->safety_information['unit_price']) && is_numeric($this->safety_information['unit_price'])) {
            $unitPrice = (float) $this->safety_information['unit_price'];
        } else {
            $latestLinePrice = StockReceiptLineModel::where('material_id', $this->id)
                ->where('unit_price', '>', 0)
                ->orderByDesc('created_at')
                ->value('unit_price');
            if ($latestLinePrice !== null) {
                $unitPrice = (float) $latestLinePrice;
            }
        }

        $supplierName = $this->safety_information['supplier_name']
            ?? $this->safety_information['supplier']
            ?? 'Nhà cung cấp HTX Tân Tiến';

        $warehouseName = $this->safety_information['warehouse_name']
            ?? 'Kho Vật Tư & Nông Sản Trung Tâm Đà Lạt';

        $description = $this->safety_information['description']
            ?? $this->safety_information['dosage']
            ?? null;

        $expiryDate = $this->safety_information['expiry_date'] ?? null;
        if (!$expiryDate && $this->relationLoaded('batches') && $this->batches->isNotEmpty()) {
            $expiryDate = $this->batches->sortBy('expired_at')->first()?->expired_at?->format('Y-m-d');
        }

        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'sku' => $this->sku,
            'name' => $this->name,
            'category' => $this->category,
            'unit' => $this->unit,
            'is_durable_tool' => (bool) $this->is_durable_tool,
            'account_code' => $this->account_code ?? ($this->is_durable_tool ? '1525' : '1521'),
            'reorder_threshold' => (float) $this->reorder_threshold,
            'min_safety_stock' => (float) $this->reorder_threshold,
            'available_stock' => $availableStock,
            'current_stock' => $availableStock,
            'stock_qty' => $availableStock,
            'unit_price' => $unitPrice,
            'supplier_name' => $supplierName,
            'warehouse_name' => $warehouseName,
            'description' => $description,
            'expiry_date' => $expiryDate,
            'safety_information' => $this->safety_information,
            'status' => $this->status,
            'batches' => $this->relationLoaded('batches') ? $this->batches->map(fn ($b) => [
                'id' => $b->id,
                'batch_code' => $b->batch_number,
                'quantity' => (float) $b->quantity,
                'initial_quantity' => (float) $b->initial_quantity,
                'manufacture_date' => $b->manufactured_at?->format('Y-m-d'),
                'expired_at' => $b->expired_at?->format('Y-m-d'),
                'status' => $b->status,
            ]) : [],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
