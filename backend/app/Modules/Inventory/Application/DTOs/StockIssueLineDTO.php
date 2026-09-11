<?php

namespace Modules\Inventory\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class StockIssueLineDTO extends BaseDTO
{
    public function __construct(
        public readonly string $materialId,
        public readonly float $quantity,
        public readonly float $unitPrice = 0.0,
        public readonly ?string $batchCode = null
    ) {}
}
