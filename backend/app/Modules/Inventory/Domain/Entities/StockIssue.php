<?php

namespace Modules\Inventory\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class StockIssue
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $issueNumber,
        public readonly string $issueDate,
        public string $status = 'DRAFT',
        public readonly float $totalAmount = 0.0,
        public readonly ?string $memberId = null,
        public readonly ?string $purpose = null,
        public readonly ?string $createdBy = null,
        public ?string $approvedBy = null
    ) {}

    public function submit(): void
    {
        if ($this->status !== 'DRAFT') {
            throw new DomainException('Chỉ phiếu xuất kho ở trạng thái DRAFT mới có thể gửi duyệt', 'INVALID_ISSUE_STATE');
        }
        $this->status = 'SUBMITTED';
    }

    public function approve(string $userId): void
    {
        if ($this->status === 'APPROVED') {
            return; // Idempotent approval
        }
        if ($this->status !== 'SUBMITTED' && $this->status !== 'DRAFT') {
            throw new DomainException('Trạng thái phiếu xuất kho không hợp lệ để duyệt', 'INVALID_ISSUE_STATE');
        }
        $this->status = 'APPROVED';
        $this->approvedBy = $userId;
    }
}
