<?php

namespace Modules\Inventory\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class StockCountLineDTO extends BaseDTO
{
    public function __construct(
        public readonly string $materialId,
        public readonly float $actualQuantity,
        public readonly ?string $reason = null
    ) {}
}
