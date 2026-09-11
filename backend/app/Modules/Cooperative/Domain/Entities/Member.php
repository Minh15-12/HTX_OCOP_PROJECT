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
        if ($this->status !== 'DRAFT') {
            throw new DomainException('Chỉ xã viên ở trạng thái DRAFT mới có thể phê duyệt kết nạp', 'INVALID_STATUS_TRANSITION');
        }
        $this->status = 'ACTIVE';
    }

    public function transitionTo(string $targetStatus): void
    {
        $allowedTransitions = [
            'DRAFT' => ['ACTIVE'],
            'ACTIVE' => ['PENDING_TERMINATION'],
            'PENDING_TERMINATION' => ['TERMINATED'],
            'TERMINATED' => [],
        ];

        if (!isset($allowedTransitions[$this->status]) || !in_array($targetStatus, $allowedTransitions[$this->status], true)) {
            throw new DomainException(
                "Không thể chuyển trạng thái từ [{$this->status}] sang [{$targetStatus}]",
                'INVALID_STATUS_TRANSITION'
            );
        }

        $this->status = $targetStatus;
        if ($targetStatus === 'TERMINATED') {
            $this->terminationDate = now()->toDateString();
        }
    }
}
