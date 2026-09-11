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
        public readonly ?array $qualityInformation = null
    ) {}
}
