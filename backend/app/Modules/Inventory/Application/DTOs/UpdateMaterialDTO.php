<?php

namespace Modules\Inventory\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateMaterialDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $category = null,
        public readonly ?string $unit = null,
        public readonly ?array $safetyInformation = null,
        public readonly ?float $reorderThreshold = null,
        public readonly ?string $status = null
    ) {}
}
