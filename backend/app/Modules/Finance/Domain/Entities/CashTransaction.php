<?php

namespace Modules\Finance\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class CashTransaction
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $voucherNumber,
        public readonly string $transactionType,
        public readonly float $amount,
        public readonly string $transactionDate,
        public readonly string $category,
        public string $status = 'DRAFT',
        public readonly ?string $description = null,
        public readonly ?string $payerPayee = null,
        public readonly ?string $memberId = null,
        public readonly ?array $evidenceReference = null,
        public readonly ?string $createdBy = null,
        public ?string $approvedBy = null
    ) {
        if (!in_array($this->transactionType, ['INCOME', 'EXPENSE'], true)) {
            throw new DomainException('Loại giao dịch tiền mặt phải là INCOME hoặc EXPENSE', 'INVALID_TRANSACTION_TYPE');
        }
        if ($this->amount <= 0) {
            throw new DomainException('Số tiền giao dịch phải lớn hơn 0', 'INVALID_TRANSACTION_AMOUNT');
        }
    }

    public function approve(string $userId): void
    {
        if ($this->status === 'APPROVED' || $this->status === 'POSTED') {
            return;
        }
        if ($this->status !== 'DRAFT') {
            throw new DomainException('Chỉ phiếu thu/chi DRAFT mới có thể duyệt', 'INVALID_TRANSACTION_STATE');
        }
        $this->status = 'APPROVED';
        $this->approvedBy = $userId;
    }

    public function post(): void
    {
        if ($this->status === 'POSTED') {
            return; // Idempotent
        }
        if ($this->status !== 'APPROVED' && $this->status !== 'DRAFT') {
            throw new DomainException('Phiếu thu/chi phải ở trạng thái APPROVED hoặc DRAFT mới có thể ghi sổ (POSTED)', 'INVALID_TRANSACTION_STATE');
        }
        $this->status = 'POSTED';
    }
}
