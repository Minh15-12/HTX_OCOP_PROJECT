<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Ocop\Evaluation\Domain\Entities\FinalDecision;

class FinalDecisionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $domainEntity = new FinalDecision(
            id: $this->id,
            applicationId: $this->application_id,
            decisionNumber: $this->decision_number,
            decisionDate: $this->decision_date ? $this->decision_date->format('Y-m-d') : date('Y-m-d'),
            finalClassification: $this->final_classification,
            authorityReference: $this->authority_reference,
            effectiveDate: $this->effective_date ? $this->effective_date->format('Y-m-d') : null,
            documentReference: $this->document_reference,
            status: $this->status
        );

        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'decision_number' => $this->decision_number,
            'decision_date' => $this->decision_date?->format('Y-m-d'),
            'final_classification' => $this->final_classification,
            'effective_date' => $this->effective_date?->format('Y-m-d'),
            'expiration_date' => $domainEntity->getExpirationDate(),
            'authority_reference' => $this->authority_reference,
            'document_reference' => $this->document_reference,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
