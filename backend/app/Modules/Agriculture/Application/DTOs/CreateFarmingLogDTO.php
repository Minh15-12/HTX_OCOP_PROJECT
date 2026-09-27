<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateFarmingLogDTO extends BaseDTO
{
    public function __construct(
        public readonly string $cropSeasonId,
        public readonly string $plotId,
        public readonly string $activityType,
        public readonly string $activityDate,
        public readonly ?string $description = null,
        public readonly ?string $performedBy = null,
        public readonly ?array $attachmentReference = null,
        public readonly ?string $materialId = null,
        public readonly ?string $materialBatchNumber = null,
        public readonly ?float $quantityApplied = null,
        public readonly ?string $unit = null,
        public readonly ?int $phiDays = null,
        public readonly ?float $gpsLatitude = null,
        public readonly ?float $gpsLongitude = null
    ) {}
}
