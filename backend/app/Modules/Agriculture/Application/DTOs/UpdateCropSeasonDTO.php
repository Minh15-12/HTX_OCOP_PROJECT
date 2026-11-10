<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateCropSeasonDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $crop = null,
        public readonly ?string $startDate = null,
        public readonly ?string $expectedEndDate = null,
        public readonly ?string $status = null,
        public readonly ?array $planInformation = null,
        public readonly ?string $seedSupplier = null,
        public readonly ?array $seedlingStandardChecklist = null,
        public readonly ?array $buyerContractInfo = null,
        public readonly ?float $pucQuotaKg = null
    ) {}
}

