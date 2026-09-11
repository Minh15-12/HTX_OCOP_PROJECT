<?php

namespace Modules\Ocop\Evaluation\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class ConsolidatedResult
{
    public function __construct(
        public readonly string $id,
        public readonly string $applicationId,
        public readonly string $evaluationSessionId,
        public readonly float $totalScore,
        public readonly ?string $ruleVersionReference = null,
        public readonly string $consolidationStatus = 'CALCULATED',
        public readonly ?string $calculatedAt = null
    ) {
        if ($this->totalScore < 0.0 || $this->totalScore > 100.0) {
            throw new DomainException(
                "Tổng điểm trung bình ({$this->totalScore}) không hợp lệ (phải từ 0 đến 100)",
                'INVALID_TOTAL_SCORE',
                null,
                400
            );
        }
    }
}
