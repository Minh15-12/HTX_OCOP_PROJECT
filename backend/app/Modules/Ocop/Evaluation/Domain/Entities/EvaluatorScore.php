<?php

namespace Modules\Ocop\Evaluation\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class EvaluatorScore
{
    public function __construct(
        public readonly string $id,
        public readonly string $assignmentId,
        public readonly string $indicatorId,
        public readonly float $score,
        public readonly float $maxScore,
        public readonly ?string $comment = null,
        public readonly ?string $submittedAt = null,
        public readonly ?string $lockedAt = null
    ) {
        if ($this->score < 0.0 || $this->score > $this->maxScore) {
            throw new DomainException(
                "Điểm chấm ({$this->score}) phải từ 0 đến điểm tối đa của chỉ tiêu ({$this->maxScore})",
                'INVALID_EVALUATOR_SCORE',
                null,
                400
            );
        }
    }

    public function isLocked(): bool
    {
        return $this->lockedAt !== null;
    }

    public function assertEditable(): void
    {
        if ($this->isLocked()) {
            throw new DomainException(
                'Phiếu chấm điểm của giám khảo đã khóa và không thể chỉnh sửa',
                'EVALUATION_SCORE_LOCKED',
                null,
                400
            );
        }
    }
}
