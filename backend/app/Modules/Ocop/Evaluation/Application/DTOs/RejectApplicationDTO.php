<?php

namespace Modules\Ocop\Evaluation\Application\DTOs;

class RejectApplicationDTO
{
    public function __construct(
        public readonly string $decisionNumber,
        public readonly string $decisionDate,
        public readonly string $reason,
        public readonly ?array $authorityReference = null
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            decisionNumber: $data['decision_number'],
            decisionDate: $data['decision_date'],
            reason: $data['reason'],
            authorityReference: $data['authority_reference'] ?? null
        );
    }
}
