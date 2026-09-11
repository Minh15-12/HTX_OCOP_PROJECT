<?php

namespace Modules\Ocop\Dossier\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class SelfAssessment
{
    public function __construct(
        public readonly string $id,
        public readonly string $applicationId,
        public readonly string $indicatorId,
        public readonly float $score,
        public readonly float $maxScore,
        public readonly ?string $explanation = null,
        public readonly string $status = 'COMPLETED'
    ) {
        if ($this->score < 0.0 || $this->score > $this->maxScore) {
            throw new DomainException(
                "Điểm tự đánh giá ({$this->score}) phải từ 0 đến điểm tối đa của chỉ tiêu ({$this->maxScore})",
                'INVALID_SELF_ASSESSMENT_SCORE',
                null,
                400
            );
        }
    }
}
