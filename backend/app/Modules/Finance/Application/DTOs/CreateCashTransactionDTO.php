<?php

namespace Modules\Finance\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateCashTransactionDTO extends BaseDTO
{
    public function __construct(
        public readonly string $transactionType,
        public readonly float $amount,
        public readonly string $transactionDate,
        public readonly string $category,
        public readonly ?string $description = null,
        public readonly ?string $payerPayee = null,
        public readonly ?string $memberId = null,
        public readonly ?array $evidenceReference = null,
        public readonly ?string $customVoucherNumber = null,
        public readonly ?string $cooperativeId = null
    ) {}
}
