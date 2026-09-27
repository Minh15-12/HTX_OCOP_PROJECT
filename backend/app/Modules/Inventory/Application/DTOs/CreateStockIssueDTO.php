<?php

namespace Modules\Inventory\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateStockIssueDTO extends BaseDTO
{
    /**
     * @param StockIssueLineDTO[] $lines
     */
    public function __construct(
        public readonly string $issueDate,
        public readonly array $lines,
        public readonly ?string $memberId = null,
        public readonly ?string $purpose = null,
        public readonly ?string $customIssueNumber = null,
        public readonly ?string $cooperativeId = null,
        public readonly bool $isCredit = false
    ) {}
}
