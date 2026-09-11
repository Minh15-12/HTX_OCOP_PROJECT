<?php

namespace Modules\Finance\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateReceivablePayableDTO extends BaseDTO
{
    public function __construct(
        public readonly string $debtType,
        public readonly string $counterpartyType,
        public readonly string $counterpartyName,
        public readonly float $originalAmount,
        public readonly string $dueDate,
        public readonly ?string $counterpartyId = null,
        public readonly ?string $description = null,
        public readonly ?string $customDebtCode = null,
        public readonly ?string $cooperativeId = null
    ) {}
}
