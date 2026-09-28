<?php

namespace Modules\Notification\Domain\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class LowStockNotification extends Notification
{
    use Queueable;

    public function __construct(
        public MaterialModel $material,
        public float $currentStock
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'LOW_STOCK',
            'material_id' => $this->material->id,
            'material_name' => $this->material->name,
            'current_stock' => $this->currentStock,
            'reorder_threshold' => $this->material->reorder_threshold,
            'message' => "Cảnh báo tồn kho: Vật tư {$this->material->name} (SKU: {$this->material->sku}) có lượng tồn kho hiện tại ({$this->currentStock}) dưới mức an toàn ({$this->material->reorder_threshold}).",
        ];
    }
}
