<?php

namespace Modules\Ocop\Evaluation\Domain\Entities;

class ProposedClassification
{
    public const VALID_LEVELS = ['UNRATED', '1_STAR', '2_STAR', '3_STAR', '4_STAR', '5_STAR'];

    public function __construct(
        public readonly string $id,
        public readonly string $applicationId,
        public readonly string $resultId,
        public readonly string $proposedLevel,
        public readonly ?string $ruleVersionReference = null,
        public readonly ?string $reason = null,
        public readonly string $status = 'PROPOSED'
    ) {
    }

    /**
     * Determines raw star classification based on score according to OCOP business rules:
     * - < 30: UNRATED
     * - 30 - 49: 1_STAR
     * - 50 - 69: 2_STAR
     * - 70 - 79: 3_STAR
     * - 80 - 89: 4_STAR
     * - 90 - 100: 5_STAR
     */
    public static function calculateRawClassification(float $score): string
    {
        if ($score >= 90.0) {
            return '5_STAR';
        }
        if ($score >= 80.0) {
            return '4_STAR';
        }
        if ($score >= 70.0) {
            return '3_STAR';
        }
        if ($score >= 50.0) {
            return '2_STAR';
        }
        if ($score >= 30.0) {
            return '1_STAR';
        }

        return 'UNRATED';
    }
}
