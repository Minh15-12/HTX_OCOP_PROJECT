<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateHarvestDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $harvestDate = null,
        public readonly ?float $quantity = null,
        public readonly ?string $unit = null,
        public readonly ?array $qualityInformation = null
    ) {}
}
