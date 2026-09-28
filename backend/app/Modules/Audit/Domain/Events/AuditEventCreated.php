<?php

namespace Modules\Audit\Domain\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel;

class AuditEventCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public AuditEventModel $auditEvent
    ) {}
}
