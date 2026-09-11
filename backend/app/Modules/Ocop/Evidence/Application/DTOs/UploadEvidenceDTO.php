<?php

namespace Modules\Ocop\Evidence\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;
use Illuminate\Http\UploadedFile;

class UploadEvidenceDTO extends BaseDTO
{
    public function __construct(
        public readonly string $applicationId,
        public readonly string $title,
        public readonly string $evidenceType,
        public readonly UploadedFile $file
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            applicationId: (string) ($data['application_id'] ?? ''),
            title: (string) ($data['title'] ?? ''),
            evidenceType: (string) ($data['evidence_type'] ?? ''),
            file: $data['file']
        );
    }
}
