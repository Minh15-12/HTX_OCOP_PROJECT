<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateFarmPlotDTO extends BaseDTO
{
    public function __construct(
        public readonly string $productionUnitId,
        public readonly string $plotCode,
        public readonly float $area,
        public readonly ?array $landRelation = null,
        public readonly ?string $nationalCadastralCode = null,
        public readonly ?string $landSheetNumber = null,
        public readonly ?string $landParcelNumber = null,
        public readonly ?int $substrateBagCount = null,
        public readonly ?float $plantingDensityPerSqm = null,
        public readonly ?string $greenhouseType = null,
        public readonly ?array $geometryGeojson = null,
        public readonly ?array $vn2000Coordinates = null,
        public readonly ?float $maxYieldRatePerSqm = null,
        public readonly ?string $landContractExpiredAt = null
    ) {}
}

