<?php

namespace Modules\Ocop\Evaluation\Application\DTOs;

class ApproveFinalDecisionDTO
{
    public function __construct(
        public readonly string $decisionNumber,
        public readonly string $decisionDate,
        public readonly string $finalClassification,
        public readonly ?array $authorityReference = null,
        public readonly ?string $effectiveDate = null,
        public readonly ?array $documentReference = null
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            decisionNumber: $data['decision_number'],
            decisionDate: $data['decision_date'],
            finalClassification: $data['final_classification'],
            authorityReference: $data['authority_reference'] ?? null,
            effectiveDate: $data['effective_date'] ?? null,
            documentReference: $data['document_reference'] ?? null
        );
    }
}
