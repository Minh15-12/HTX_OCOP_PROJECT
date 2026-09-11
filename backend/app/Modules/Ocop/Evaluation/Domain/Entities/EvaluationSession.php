<?php

namespace Modules\Ocop\Evaluation\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class EvaluationSession
{
    public function __construct(
        public readonly string $id,
        public readonly string $applicationId,
        public readonly string $councilLevelId,
        public string $status = 'ASSIGNED', // ASSIGNED, IN_PROGRESS, COMPLETED, CONSOLIDATED, CANCELLED
        public ?string $startedAt = null,
        public ?string $completedAt = null,
        public readonly ?string $createdAt = null,
        public readonly ?string $updatedAt = null
    ) {
    }

    public function start(): void
    {
        if ($this->status === 'CANCELLED') {
            throw new DomainException(
                'Không thể bắt đầu phiên họp đã bị hủy',
                'INVALID_EVALUATION_SESSION_STATUS',
                null,
                400
            );
        }
        $this->status = 'IN_PROGRESS';
        $this->startedAt = date('Y-m-d H:i:s');
    }

    public function complete(): void
    {
        if ($this->status !== 'IN_PROGRESS' && $this->status !== 'ASSIGNED') {
            throw new DomainException(
                'Phiên đánh giá chưa sẵn sàng để hoàn thành',
                'INVALID_EVALUATION_SESSION_STATUS',
                null,
                400
            );
        }
        $this->status = 'COMPLETED';
        $this->completedAt = date('Y-m-d H:i:s');
    }

    public function markConsolidated(): void
    {
        $this->status = 'CONSOLIDATED';
    }
}
