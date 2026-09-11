<?php

namespace Modules\Identity\Domain\Entities;

class Role
{
    public function __construct(
        public readonly string $id,
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly array $permissions = []
    ) {}
}
