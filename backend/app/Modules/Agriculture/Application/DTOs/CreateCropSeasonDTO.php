<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateCropSeasonDTO extends BaseDTO
{
    public function __construct(
        public readonly string $productionUnitId,
        public readonly string $name,
        public readonly string $crop,
        public readonly string $startDate,
        public readonly string $expectedEndDate,
        public readonly ?array $planInformation = null,
        public readonly ?string $seedSupplier = null,
        public readonly ?array $seedlingStandardChecklist = null,
        public readonly ?array $buyerContractInfo = null,
        public readonly ?float $pucQuotaKg = null
    ) {}
}
