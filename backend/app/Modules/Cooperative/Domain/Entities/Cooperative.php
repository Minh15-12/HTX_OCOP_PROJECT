<?php

namespace Modules\Cooperative\Domain\Entities;

class Cooperative
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeCode,
        public readonly string $legalName,
        public readonly ?string $displayName = null,
        public readonly string $status = 'ACTIVE'
    ) {}
}
