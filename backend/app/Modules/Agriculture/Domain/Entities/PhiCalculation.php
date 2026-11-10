<?php

namespace Modules\Agriculture\Domain\Entities;

use DateTimeImmutable;

class PhiCalculation
{
    public readonly ?string $safetyDate;

    public readonly string $status;

    public function __construct(
        public readonly string $id,
        public readonly string $farmingLogId,
        public readonly string $materialId,
        public readonly string $applicationDate,
        public readonly ?int $configuredPhiDays,
        public readonly ?array $sourceReference = null
    ) {
        if ($this->configuredPhiDays === null || $this->configuredPhiDays < 0) {
            $this->safetyDate = null;
            $this->status = 'UNKNOWN';
        } else {
            $appDate = new DateTimeImmutable($this->applicationDate);
            $safetyDt = $appDate->modify("+{$this->configuredPhiDays} days");
            $this->safetyDate = $safetyDt->format('Y-m-d');

            $today = new DateTimeImmutable('today');
            if ($today >= $safetyDt) {
                $this->status = 'SAFE';
            } else {
                $this->status = 'ISOLATED';
            }
        }
    }
}
