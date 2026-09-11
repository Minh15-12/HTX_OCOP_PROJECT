<?php

namespace Modules\Cooperative\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateCapitalContributionDTO extends BaseDTO
{
    public function __construct(
        public readonly string $memberId,
        public readonly string $contributionType,
        public readonly float $amount,
        public readonly string $transactionDate,
        public readonly ?string $valueDescription = null,
        public readonly ?array $evidenceReference = null
    ) {}
}
