<?php

namespace Modules\Inventory\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateStockReceiptDTO extends BaseDTO
{
    /**
     * @param  StockReceiptLineDTO[]  $lines
     */
    public function __construct(
        public readonly string $receiptDate,
        public readonly array $lines,
        public readonly ?string $customReceiptNumber = null,
        public readonly ?array $supplierInformation = null,
        public readonly ?array $evidenceReference = null,
        public readonly ?string $cooperativeId = null
    ) {}
}
