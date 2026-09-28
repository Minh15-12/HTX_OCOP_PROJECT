<?php

namespace Modules\Notification\Domain\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;

class ExpiringOcopNotification extends Notification
{
    use Queueable;

    public function __construct(
        public OcopApplicationModel $application
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $application = $this->application->loadMissing('product');
        return [
            'type' => 'OCOP_EXPIRING',
            'application_id' => $application->id,
            'application_number' => $application->application_number,
            'product_name' => $application->product ? $application->product->name : 'N/A',
            'message' => "Chứng nhận OCOP của sản phẩm {$application->product?->name} (Hồ sơ: {$application->application_number}) sẽ hết hạn trong vòng 3 tháng tới. Vui lòng chuẩn bị hồ sơ tái đánh giá.",
        ];
    }
}
