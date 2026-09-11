<?php

namespace Modules\Product\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateProductDTO extends BaseDTO
{
    public function __construct(
        public readonly string $productCode,
        public readonly string $productName,
        public readonly string $category,
        public readonly ?array $specification = null,
        public readonly ?string $brand = null,
        public readonly ?array $qualityInformation = null,
        public readonly ?string $cooperativeId = null
    ) {}
}
