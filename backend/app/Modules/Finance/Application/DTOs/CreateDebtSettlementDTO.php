<?php

namespace Modules\Finance\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateDebtSettlementDTO extends BaseDTO
{
    public function __construct(
        public readonly string $debtId,
        public readonly string $settlementDate,
        public readonly float $amount,
        public readonly string $paymentMethod = 'CASH',
        public readonly ?string $referenceNumber = null,
        public readonly ?string $note = null
    ) {}
}
