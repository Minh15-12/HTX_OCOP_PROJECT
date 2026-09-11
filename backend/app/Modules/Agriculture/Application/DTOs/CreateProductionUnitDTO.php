<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateProductionUnitDTO extends BaseDTO
{
    public function __construct(
        public readonly string $unitCode,
        public readonly string $name,
        public readonly string $crop,
        public readonly float $area,
        public readonly ?array $location = null,
        public readonly ?array $registrationInformation = null,
        public readonly ?string $cooperativeId = null
    ) {}
}
