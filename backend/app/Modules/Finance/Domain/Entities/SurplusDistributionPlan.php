<?php

namespace Modules\Finance\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class SurplusDistributionPlan
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $planCode,
        public readonly int $financialYear,
        public readonly float $totalSurplus,
        public readonly float $distributableSurplus,
        public readonly float $capitalWeight = 50.0,
        public readonly float $serviceUsageWeight = 50.0,
        public string $status = 'DRAFT',
        public readonly ?string $createdBy = null,
        public ?string $approvedBy = null
    ) {
        if ($this->totalSurplus <= 0) {
            throw new DomainException('Tổng thặng dư phải lớn hơn 0', 'INVALID_TOTAL_SURPLUS');
        }
        if ($this->distributableSurplus <= 0 || $this->distributableSurplus > $this->totalSurplus) {
            throw new DomainException('Thặng dư được phép phân phối không hợp lệ', 'INVALID_DISTRIBUTABLE_SURPLUS');
        }
        if (abs(($this->capitalWeight + $this->serviceUsageWeight) - 100.0) > 0.01) {
            throw new DomainException('Tổng trọng số phân phối theo Vốn và Dịch vụ phải bằng 100%', 'INVALID_WEIGHT_SUM');
        }
    }

    public function submit(): void
    {
        if ($this->status !== 'DRAFT') {
            throw new DomainException('Chỉ phương án phân phối DRAFT mới có thể gửi duyệt', 'INVALID_PLAN_STATE');
        }
        $this->status = 'SUBMITTED';
    }

    public function approve(string $userId): void
    {
        if ($this->status === 'APPROVED') {
            return;
        }
        if ($this->status !== 'SUBMITTED' && $this->status !== 'DRAFT') {
            throw new DomainException('Phương án phân phối phải ở trạng thái SUBMITTED hoặc DRAFT mới được duyệt', 'INVALID_PLAN_STATE');
        }
        $this->status = 'APPROVED';
        $this->approvedBy = $userId;
    }
}
