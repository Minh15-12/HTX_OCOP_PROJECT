<?php

namespace Modules\Product\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class AttachProductLotDTO extends BaseDTO
{
    public function __construct(
        public readonly string $productId,
        public readonly string $lotId,
        public readonly ?float $quantity = null
    ) {}
}
