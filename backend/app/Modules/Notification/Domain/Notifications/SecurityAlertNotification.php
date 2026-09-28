<?php

namespace Modules\Notification\Domain\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SecurityAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $actionCode,
        public string $title,
        public string $message,
        public string $auditId,
        public array $details = []
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'SECURITY_ALERT',
            'action_code' => $this->actionCode,
            'title' => $this->title,
            'message' => $this->message,
            'audit_id' => $this->auditId,
            'details' => $this->details,
        ];
    }
}
