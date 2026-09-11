<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateProductionUnitDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $crop = null,
        public readonly ?float $area = null,
        public readonly ?array $location = null,
        public readonly ?string $status = null,
        public readonly ?array $registrationInformation = null
    ) {}
}
