<?php

namespace Modules\Finance\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateSurplusDistributionPlanDTO extends BaseDTO
{
    public function __construct(
        public readonly int $financialYear,
        public readonly float $totalSurplus,
        public readonly float $distributableSurplus,
        public readonly float $capitalWeight = 50.0,
        public readonly float $serviceUsageWeight = 50.0,
        public readonly ?string $customPlanCode = null,
        public readonly ?string $cooperativeId = null
    ) {}
}
