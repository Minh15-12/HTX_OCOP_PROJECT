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

        $application = $this->relationLoaded('application') ? $this->application : null;
        $product = $application && $application->relationLoaded('product') ? $application->product : null;
        $cooperative = $application && $application->relationLoaded('cooperative') ? $application->cooperative : null;

        $starRating = match($this->final_classification) {
            'FIVE_STAR' => 5,
            'FOUR_STAR' => 4,
            'THREE_STAR' => 3,
            default => 0,
        };

        $issuer = $this->authority_reference['issuer'] ?? '';
        $level = $this->authority_reference['level'] ?? (
            str_contains(mb_strtolower($issuer), 'huyện') ? 'DISTRICT' :
            (str_contains(mb_strtolower($issuer), 'tỉnh') ? 'PROVINCIAL' : 'CENTRAL')
        );

        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'application_code' => $application?->application_code ?? 'OCOP-' . substr($this->application_id, 0, 8),
            'product_name' => $product?->product_name ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'cooperative_name' => $cooperative?->legal_name ?? 'HTX Nông Nghiệp Tân Tiến',
            'council_level' => $level,
            'star_rating' => $starRating,
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
