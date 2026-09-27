<?php

namespace Modules\Cooperative\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateMemberDTO extends BaseDTO
{
    public function __construct(
        public readonly string $memberCode,
        public readonly array $identityInformation,
        public readonly string $memberType = 'OFFICIAL',
        public readonly ?string $userId = null,
        public readonly ?string $admissionDate = null,
        public readonly ?string $cooperativeId = null,
        public readonly float $creditLimit = 0.0
    ) {}
}
