<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateLotDTO extends BaseDTO
{
    public function __construct(
        public readonly string $harvestId,
        public readonly ?float $quantity = null,
        public readonly ?string $unit = null,
        public readonly ?string $customLotCode = null,
        public readonly ?array $sourceInformation = null
    ) {}
}
