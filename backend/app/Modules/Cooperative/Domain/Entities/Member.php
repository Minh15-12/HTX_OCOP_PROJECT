<?php

namespace Modules\Cooperative\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class Member
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $memberCode,
        public readonly array $identityInformation,
        public readonly string $memberType = 'OFFICIAL',
        public string $status = 'DRAFT',
        public readonly ?string $userId = null,
        public readonly ?string $admissionDate = null,
        public ?string $terminationDate = null
    ) {}

    public function approve(): void
    {
        if (!in_array($this->status, ['DRAFT', 'PROSPECTIVE'], true)) {
            throw new DomainException('Chỉ xã viên ở trạng thái DRAFT hoặc PROSPECTIVE mới có thể phê duyệt kết nạp', 'ERR_MEMBER_INVALID_STATUS_TRANSITION', null, 400);
        }
        $this->status = 'ACTIVE';
    }

    public function transitionTo(string $targetStatus): void
    {
        $allowedTransitions = [
            'DRAFT' => ['ACTIVE', 'PROSPECTIVE', 'TERMINATED'],
            'PROSPECTIVE' => ['ACTIVE', 'TERMINATED'],
            'ACTIVE' => ['SUSPENDED', 'LEAVING', 'PENDING_TERMINATION', 'TERMINATED'],
            'SUSPENDED' => ['ACTIVE', 'TERMINATED'],
            'LEAVING' => ['TERMINATED', 'ACTIVE'],
            'PENDING_TERMINATION' => ['TERMINATED', 'ACTIVE'],
            'TERMINATED' => [],
        ];

        if (!isset($allowedTransitions[$this->status]) || !in_array($targetStatus, $allowedTransitions[$this->status], true)) {
            throw new DomainException(
                "Không thể chuyển trạng thái xã viên từ [{$this->status}] sang [{$targetStatus}]",
                'ERR_MEMBER_INVALID_STATUS_TRANSITION',
                null,
                400
            );
        }

        $this->status = $targetStatus;
        if ($targetStatus === 'TERMINATED') {
            $this->terminationDate = now()->toDateString();
        }
    }
}
