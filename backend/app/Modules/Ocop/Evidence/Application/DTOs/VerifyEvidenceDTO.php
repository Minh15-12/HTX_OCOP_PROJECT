<?php

namespace Modules\Ocop\Evidence\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class VerifyEvidenceDTO extends BaseDTO
{
    public function __construct(
        public readonly string $evidenceId,
        public readonly string $status, // VERIFIED, REJECTED
        public readonly ?string $reason = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            evidenceId: (string) ($data['evidence_id'] ?? ''),
            status: (string) ($data['status'] ?? 'VERIFIED'),
            reason: isset($data['reason']) ? (string) $data['reason'] : null
        );
    }
}
