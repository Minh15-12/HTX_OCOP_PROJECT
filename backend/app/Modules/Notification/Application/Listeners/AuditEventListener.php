<?php

namespace Modules\Notification\Application\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Modules\Audit\Domain\Events\AuditEventCreated;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Notification\Domain\Notifications\SecurityAlertNotification;

class AuditEventListener implements ShouldQueue
{
    public function handle(AuditEventCreated $event): void
    {
        $audit = $event->auditEvent;

        $triggerActions = [
            'PHI_VIOLATION_ATTEMPTED' => 'Cảnh báo vi phạm thời gian cách ly an toàn (PHI Guard)',
            'PROHIBITED_SUBSTANCE_DETECTED' => 'Cảnh báo phát hiện hoạt chất cấm trong vật tư',
        ];

        if (!array_key_exists($audit->action, $triggerActions)) {
            return;
        }

        try {
            $directors = UserModel::whereHas('roles', function ($q) {
                $q->where('code', 'DIRECTOR');
            })->where('cooperative_id', $audit->cooperative_id)->get();

            $title = $triggerActions[$audit->action];
            $message = "Hệ thống phát hiện vi phạm: {$title}. Vui lòng kiểm tra Audit Log ID: {$audit->id}";

            foreach ($directors as $director) {
                $director->notify(new SecurityAlertNotification(
                    $audit->action,
                    $title,
                    $message,
                    $audit->id,
                    $audit->after_reference ?? []
                ));
            }
        } catch (\Throwable $e) {
            Log::error('Failed to process AuditEventListener: '.$e->getMessage());
        }
    }
}
