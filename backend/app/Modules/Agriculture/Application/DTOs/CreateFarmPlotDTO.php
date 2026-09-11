<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateFarmPlotDTO extends BaseDTO
{
    public function __construct(
        public readonly string $productionUnitId,
        public readonly string $plotCode,
        public readonly float $area,
        public readonly ?array $landRelation = null
    ) {}
}
