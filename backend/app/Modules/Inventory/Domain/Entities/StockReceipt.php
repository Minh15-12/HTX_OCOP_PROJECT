<?php

namespace Modules\Inventory\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class StockReceipt
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $receiptNumber,
        public readonly string $receiptDate,
        public string $status = 'DRAFT',
        public readonly float $totalAmount = 0.0,
        public readonly ?array $supplierInformation = null,
        public readonly ?array $evidenceReference = null,
        public readonly ?string $createdBy = null,
        public ?string $approvedBy = null
    ) {}

    public function submit(): void
    {
        if ($this->status !== 'DRAFT') {
            throw new DomainException('Chỉ phiếu nhập kho ở trạng thái DRAFT mới có thể gửi duyệt', 'INVALID_RECEIPT_STATE');
        }
        $this->status = 'SUBMITTED';
    }

    public function approve(string $userId): void
    {
        if ($this->status === 'APPROVED') {
            return; // Idempotent approval
        }
        if ($this->status !== 'SUBMITTED' && $this->status !== 'DRAFT') {
            throw new DomainException('Trạng thái phiếu nhập kho không hợp lệ để duyệt', 'INVALID_RECEIPT_STATE');
        }
        $this->status = 'APPROVED';
        $this->approvedBy = $userId;
    }
}
