<?php

namespace Modules\Notification\Domain\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;

class OverdueCapitalNotification extends Notification
{
    use Queueable;

    public function __construct(
        public MemberModel $member,
        public float $deficit
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'OVERDUE_CAPITAL',
            'member_id' => $this->member->id,
            'member_code' => $this->member->member_code,
            'deficit' => $this->deficit,
            'message' => "Thành viên {$this->member->member_code} đã quá hạn đóng vốn góp. Số tiền còn thiếu: ".number_format($this->deficit).' VNĐ.',
        ];
    }
}
