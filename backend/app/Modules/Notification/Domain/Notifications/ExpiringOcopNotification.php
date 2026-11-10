<?php

namespace Modules\Notification\Domain\Notifications;

use App\Mail\OcopExpiringMail;
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
        return !empty($notifiable->email) ? ['database', 'mail'] : ['database'];
    }

    public function toMail($notifiable)
    {
        $application = $this->application->loadMissing('product');

        return (new OcopExpiringMail([
            'product_name' => $application->product ? $application->product->name : 'N/A',
            'application_number' => $application->application_number,
            'star_rating' => $application->star_rating ?? 4,
            'decision_number' => 'QĐ 842/QĐ-UBND Tỉnh Lâm Đồng',
            'expiry_date' => date('d/m/Y', strtotime('+85 days')),
            'days_remaining' => 85,
        ]))->to($notifiable->email);
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
