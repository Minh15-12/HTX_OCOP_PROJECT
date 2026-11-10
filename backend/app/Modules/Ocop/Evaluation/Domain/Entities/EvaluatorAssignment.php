<?php

namespace Modules\Ocop\Evaluation\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class EvaluatorAssignment
{
    public function __construct(
        public readonly string $id,
        public readonly string $evaluationSessionId,
        public readonly string $evaluatorId,
        public readonly string $role = 'MEMBER', // CHAIRMAN, SECRETARY, MEMBER
        public string $status = 'ASSIGNED', // ASSIGNED, SCORING, SUBMITTED, LOCKED
        public readonly ?string $assignedAt = null,
        public ?string $completedAt = null
    ) {}

    public function lock(): void
    {
        if ($this->status === 'LOCKED') {
            throw new DomainException(
                'Phiếu phân công giám khảo đã được khóa trước đó',
                'EVALUATION_SCORE_LOCKED',
                null,
                400
            );
        }
        $this->status = 'LOCKED';
        $this->completedAt = date('Y-m-d H:i:s');
    }

    public function isLocked(): bool
    {
        return $this->status === 'LOCKED';
    }
}
