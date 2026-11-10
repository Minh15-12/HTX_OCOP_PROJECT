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
        public readonly ?float $gpsLongitude = null,
        public readonly ?string $fertigationMethod = null,
        public readonly ?float $ecSolution = null,
        public readonly ?float $ecDrain = null,
        public readonly ?float $phSolution = null,
        public readonly ?array $tankComposition = null,
        public readonly ?string $pestTarget = null,
        public readonly ?string $pestDensity = null,
        public readonly ?string $activeIngredient = null,
        public readonly ?string $resistanceGroup = null,
        public readonly ?string $materialLotNumber = null,
        public readonly ?string $materialExportSlipCode = null,
        public readonly ?string $biocontrolAgentName = null,
        public readonly ?string $biocontrolReleaseRate = null,
        public readonly ?float $waterVolumeLiters = null,
        public readonly ?string $applicationEquipment = null,
        public readonly ?string $clientUuid = null,
        public readonly ?array $items = null,
        public readonly ?string $voiceRawText = null,
        public readonly ?string $status = null
    ) {}
}
