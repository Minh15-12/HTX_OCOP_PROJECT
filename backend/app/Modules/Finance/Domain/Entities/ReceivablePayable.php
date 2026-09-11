<?php

namespace Modules\Finance\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class ReceivablePayable
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $debtCode,
        public readonly string $debtType,
        public readonly string $counterpartyType,
        public readonly string $counterpartyName,
        public readonly float $originalAmount,
        public float $outstandingAmount,
        public readonly string $dueDate,
        public string $status = 'OPEN',
        public readonly ?string $counterpartyId = null,
        public readonly ?string $description = null
    ) {
        if (!in_array($this->debtType, ['RECEIVABLE', 'PAYABLE'], true)) {
            throw new DomainException('Loại công nợ phải là RECEIVABLE hoặc PAYABLE', 'INVALID_DEBT_TYPE');
        }
        if ($this->originalAmount <= 0) {
            throw new DomainException('Số tiền nợ gốc phải lớn hơn 0', 'INVALID_DEBT_AMOUNT');
        }
        if ($this->outstandingAmount < 0 || $this->outstandingAmount > $this->originalAmount) {
            throw new DomainException('Dư nợ còn lại không hợp lệ', 'INVALID_OUTSTANDING_AMOUNT');
        }
    }

    public function applySettlement(float $amount): void
    {
        if ($amount <= 0) {
            throw new DomainException('Số tiền thanh toán cấn trừ nợ phải lớn hơn 0', 'INVALID_SETTLEMENT_AMOUNT');
        }
        if ($amount > $this->outstandingAmount) {
            throw new DomainException("Số tiền thanh toán [{$amount}] vượt quá dư nợ còn lại [{$this->outstandingAmount}]", 'OVER_SETTLEMENT_VIOLATION');
        }

        $this->outstandingAmount -= $amount;

        if ($this->outstandingAmount == 0.0) {
            $this->status = 'SETTLED';
        } else {
            $this->status = 'PARTIALLY_SETTLED';
        }
    }
}
