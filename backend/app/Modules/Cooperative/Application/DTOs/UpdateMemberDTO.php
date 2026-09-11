<?php

namespace Modules\Cooperative\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateMemberDTO extends BaseDTO
{
    public function __construct(
        public readonly ?array $identityInformation = null,
        public readonly ?string $memberType = null,
        public readonly ?string $userId = null,
        public readonly ?string $admissionDate = null
    ) {}
}
