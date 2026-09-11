<?php

namespace Modules\Ocop\Evidence\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;
use Illuminate\Http\UploadedFile;

class ReplaceEvidenceVersionDTO extends BaseDTO
{
    public function __construct(
        public readonly string $evidenceId,
        public readonly string $replacementReason,
        public readonly UploadedFile $file
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            evidenceId: (string) ($data['evidence_id'] ?? ''),
            replacementReason: (string) ($data['replacement_reason'] ?? ''),
            file: $data['file']
        );
    }
}
