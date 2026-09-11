<?php

namespace Modules\Identity\Domain\Entities;

use Modules\Identity\Domain\Enums\UserStatus;
use Modules\Identity\Domain\ValueObjects\Email;

class User
{
    public function __construct(
        public readonly string $id,
        public readonly string $username,
        public readonly Email $email,
        public readonly string $fullName,
        public readonly ?string $cooperativeId = null,
        public readonly UserStatus $status = UserStatus::ACTIVE,
        public readonly array $roles = []
    ) {}
}
