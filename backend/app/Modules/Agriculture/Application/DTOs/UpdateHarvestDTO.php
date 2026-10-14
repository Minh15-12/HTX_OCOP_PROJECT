<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateHarvestDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $harvestDate = null,
        public readonly ?float $quantity = null,
        public readonly ?string $unit = null,
        public readonly ?array $qualityInformation = null,
        public readonly ?string $kcsStatus = null,
        public readonly ?array $kcsGateCheck = null,
        public readonly ?array $kcsQuickLab = null,
        public readonly ?string $grade = null,
        public readonly ?float $brixLevel = null,
        public readonly ?float $uniformityRate = null,
        public readonly ?float $gradeAKg = null,
        public readonly ?float $gradeBKg = null,
        public readonly ?float $rejectKg = null
    ) {}
}
