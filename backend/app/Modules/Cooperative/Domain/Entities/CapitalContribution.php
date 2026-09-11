<?php

namespace Modules\Cooperative\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class CapitalContribution
{
    public function __construct(
        public readonly string $id,
        public readonly string $memberId,
        public readonly string $contributionType, // INITIAL, ADDITIONAL, LAND, ASSET
        public readonly float $amount,
        public readonly string $transactionDate,
        public readonly ?string $valueDescription = null,
        public readonly ?array $evidenceReference = null,
        public readonly string $status = 'PAID'
    ) {
        if ($this->amount <= 0) {
            throw new DomainException('Số tiền góp vốn phải lớn hơn 0', 'INVALID_AMOUNT');
        }
    }
}
