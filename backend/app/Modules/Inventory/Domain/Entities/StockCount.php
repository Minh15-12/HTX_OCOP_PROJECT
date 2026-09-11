<?php

namespace Modules\Inventory\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class StockCount
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $countNumber,
        public readonly string $countDate,
        public string $status = 'DRAFT',
        public readonly ?array $scope = null,
        public readonly ?string $reason = null,
        public readonly ?string $createdBy = null,
        public ?string $approvedBy = null
    ) {}

    public function complete(): void
    {
        if ($this->status !== 'DRAFT') {
            throw new DomainException('Chỉ phiếu kiểm kê ở trạng thái DRAFT mới có thể hoàn thành', 'INVALID_COUNT_STATE');
        }
        $this->status = 'COMPLETED';
    }

    public function approve(string $userId): void
    {
        if ($this->status === 'APPROVED') {
            return; // Idempotent approval
        }
        if ($this->status !== 'COMPLETED' && $this->status !== 'DRAFT') {
            throw new DomainException('Trạng thái phiếu kiểm kê không hợp lệ để duyệt', 'INVALID_COUNT_STATE');
        }
        $this->status = 'APPROVED';
        $this->approvedBy = $userId;
    }
}
