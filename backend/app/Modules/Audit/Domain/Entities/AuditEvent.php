<?php

namespace Modules\Audit\Domain\Entities;

class AuditEvent
{
    public function __construct(
        public readonly string $id,
        public readonly ?string $actorId,
        public readonly string $action,
        public readonly string $entityType,
        public readonly ?string $entityId,
        public readonly ?array $beforeReference = null,
        public readonly ?array $afterReference = null,
        public readonly ?string $cooperativeId = null,
        public readonly ?string $ipAddress = null,
        public readonly ?string $requestId = null
    ) {}
}
