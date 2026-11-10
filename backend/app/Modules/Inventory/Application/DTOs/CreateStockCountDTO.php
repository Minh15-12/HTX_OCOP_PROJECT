<?php

namespace Modules\Inventory\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateStockCountDTO extends BaseDTO
{
    /**
     * @param  StockCountLineDTO[]  $lines
     */
    public function __construct(
        public readonly string $countDate,
        public readonly array $lines,
        public readonly ?string $reason = null,
        public readonly ?array $scope = null,
        public readonly ?string $customCountNumber = null,
        public readonly ?string $cooperativeId = null
    ) {}
}
