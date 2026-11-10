<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateHarvestDTO extends BaseDTO
{
    public function __construct(
        public readonly string $cropSeasonId,
        public readonly string $plotId,
        public readonly string $harvestDate,
        public readonly float $quantity,
        public readonly string $unit,
        public readonly ?array $qualityInformation = null,
        public readonly ?string $kcsStatus = 'PENDING_KCS',
        public readonly ?array $kcsGateCheck = null,
        public readonly ?array $kcsQuickLab = null,
        public readonly ?string $grade = 'GRADE_B',
        public readonly ?float $brixLevel = null,
        public readonly ?float $uniformityRate = null,
        public readonly ?float $gradeAKg = null,
        public readonly ?float $gradeBKg = null,
        public readonly ?float $rejectKg = null,
        public readonly ?int $stageNumber = null,
        public readonly ?string $weighingSlipCode = null,
        public readonly ?float $rejectionWeightKg = null
    ) {}
}
