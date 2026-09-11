<?php

namespace Modules\Identity\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UserData extends BaseDTO
{
    public function __construct(
        public readonly string $id,
        public readonly string $username,
        public readonly string $email,
        public readonly string $fullName,
        public readonly ?string $cooperativeId,
        public readonly string $status,
        public readonly array $roles,
        public readonly array $permissions
    ) {}
}
