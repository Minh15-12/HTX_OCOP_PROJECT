<?php

namespace Modules\Ocop\Evidence\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class EvidenceVersion
{
    public const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ];

    public const MAX_FILE_SIZE_BYTES = 52428800; // 50MB

    public function __construct(
        public readonly string $id,
        public readonly string $evidenceId,
        public readonly int $versionNumber,
        public readonly string $fileReference,
        public readonly string $fileName,
        public readonly string $checksum,
        public readonly string $mimeType,
        public readonly int $fileSize,
        public readonly string $uploadedBy,
        public readonly ?string $uploadedAt = null,
        public readonly ?string $replacementReason = null
    ) {
        if ($this->versionNumber < 1) {
            throw new DomainException('Số phiên bản phải lớn hơn 0', 'INVALID_VERSION_NUMBER');
        }
        if (!in_array($this->mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw new DomainException(
                "Định dạng file [{$this->mimeType}] không được hỗ trợ. Chỉ chấp nhận PDF, JPEG, PNG",
                'INVALID_FILE_FORMAT',
                null,
                400
            );
        }
        if ($this->fileSize > self::MAX_FILE_SIZE_BYTES) {
            throw new DomainException(
                'Dung lượng file vượt quá giới hạn tối đa 50MB',
                'FILE_TOO_LARGE',
                null,
                400
            );
        }
    }
}
