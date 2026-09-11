<?php

namespace Modules\Ocop\Evidence\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class Evidence
{
    public const ALLOWED_TYPES = [
        'CERTIFICATE',
        'LAB_REPORT',
        'PROCESS_PHOTO',
        'LEGAL_DOCUMENT',
    ];

    public function __construct(
        public readonly string $id,
        public readonly string $applicationId,
        public readonly string $title,
        public readonly string $evidenceType,
        public readonly string $sourceType = 'UPLOAD',
        public string $status = 'ACTIVE',
        public ?string $currentVersionId = null,
        public ?string $verifiedBy = null,
        public ?string $verifiedAt = null
    ) {
        if (trim($this->title) === '') {
            throw new DomainException('Tiêu đề minh chứng không được để trống', 'EMPTY_EVIDENCE_TITLE');
        }
        if (!in_array($this->evidenceType, self::ALLOWED_TYPES, true)) {
            throw new DomainException("Loại minh chứng [{$this->evidenceType}] không hợp lệ", 'INVALID_EVIDENCE_TYPE');
        }
    }

    public function verify(string $verifiedBy): void
    {
        $this->status = 'VERIFIED';
        $this->verifiedBy = $verifiedBy;
        $this->verifiedAt = now()->toIso8601String();
    }

    public function reject(string $verifiedBy, string $reason): void
    {
        if (trim($reason) === '') {
            throw new DomainException('Lý do từ chối minh chứng không được để trống', 'REJECTION_REASON_REQUIRED', null, 400);
        }

        $this->status = 'REJECTED';
        $this->verifiedBy = $verifiedBy;
        $this->verifiedAt = now()->toIso8601String();
    }
}
