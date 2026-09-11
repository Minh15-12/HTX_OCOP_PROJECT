<?php

namespace Modules\Ocop\Evidence\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class EvidenceLink
{
    public function __construct(
        public readonly string $evidenceId,
        public readonly string $indicatorId,
        public readonly ?string $relevance = null,
        public readonly ?string $note = null,
        public readonly ?string $createdBy = null,
        public readonly ?string $createdAt = null
    ) {
        if (trim($this->evidenceId) === '' || trim($this->indicatorId) === '') {
            throw new DomainException('Mã minh chứng và chỉ tiêu liên kết không được để trống', 'EMPTY_EVIDENCE_LINK');
        }
    }
}
