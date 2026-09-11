<?php

namespace Modules\Identity\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class LoginData extends BaseDTO
{
    public function __construct(
        public readonly string $username,
        public readonly string $password,
        public readonly ?string $deviceToken = null
    ) {}
}
