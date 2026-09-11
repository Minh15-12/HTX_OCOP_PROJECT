<?php

namespace Modules\Product\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateProductDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $productName = null,
        public readonly ?string $category = null,
        public readonly ?array $specification = null,
        public readonly ?string $brand = null,
        public readonly ?array $qualityInformation = null,
        public readonly ?string $status = null
    ) {}
}
