<?php

namespace Modules\Ocop\Evaluation\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class FinalDecision
{
    public const VALID_CLASSIFICATIONS = [
        '3_STAR', '4_STAR', '5_STAR',
        'THREE_STAR', 'FOUR_STAR', 'FIVE_STAR',
        'REJECTED'
    ];

    public function __construct(
        public readonly string $id,
        public readonly string $applicationId,
        public readonly string $decisionNumber,
        public readonly string $decisionDate,
        public readonly string $finalClassification,
        public readonly ?array $authorityReference = null,
        public readonly ?string $effectiveDate = null,
        public readonly ?array $documentReference = null,
        public readonly string $status = 'ISSUED'
    ) {
        if (!in_array($this->finalClassification, self::VALID_CLASSIFICATIONS, true)) {
            throw new DomainException(
                "Mức phân hạng chính thức không hợp lệ: {$this->finalClassification}",
                'INVALID_FINAL_CLASSIFICATION',
                null,
                400
            );
        }
    }

    /**
     * Calculate expiration date (36 months after decisionDate or effectiveDate)
     */
    public function getExpirationDate(): ?string
    {
        if ($this->finalClassification === 'REJECTED') {
            return null;
        }

        $baseDateStr = $this->effectiveDate ?? $this->decisionDate;
        $date = new \DateTimeImmutable($baseDateStr);

        return $date->modify('+36 months')->format('Y-m-d');
    }
}
