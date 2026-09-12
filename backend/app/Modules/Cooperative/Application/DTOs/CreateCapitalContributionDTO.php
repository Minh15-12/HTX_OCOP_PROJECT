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
        public readonly ?array $evidenceReference = null,
        public readonly ?string $landCertificateNo = null,
        public readonly ?string $plotNumber = null,
        public readonly ?string $mapSheetNumber = null,
        public readonly ?float $landAreaSqm = null,
        public readonly ?string $landUseType = null,
        public readonly ?float $appraisedUnitPrice = null
    ) {}
}
