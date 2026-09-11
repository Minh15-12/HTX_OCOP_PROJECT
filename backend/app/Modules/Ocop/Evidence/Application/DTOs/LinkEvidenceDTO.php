<?php

namespace Modules\Ocop\Evidence\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class LinkEvidenceDTO extends BaseDTO
{
    public function __construct(
        public readonly string $evidenceId,
        public readonly string $indicatorId,
        public readonly ?string $relevance = null,
        public readonly ?string $note = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            evidenceId: (string) ($data['evidence_id'] ?? ''),
            indicatorId: (string) ($data['indicator_id'] ?? ''),
            relevance: isset($data['relevance']) ? (string) $data['relevance'] : null,
            note: isset($data['note']) ? (string) $data['note'] : null
        );
    }
}
