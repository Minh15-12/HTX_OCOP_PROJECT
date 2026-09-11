<?php

namespace Modules\Inventory\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateMaterialDTO extends BaseDTO
{
    public function __construct(
        public readonly string $sku,
        public readonly string $name,
        public readonly string $category,
        public readonly string $unit,
        public readonly ?array $safetyInformation = null,
        public readonly float $reorderThreshold = 0.0,
        public readonly ?string $cooperativeId = null
    ) {}
}
