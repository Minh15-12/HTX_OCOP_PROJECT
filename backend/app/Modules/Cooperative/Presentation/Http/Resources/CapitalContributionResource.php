<?php

namespace Modules\Cooperative\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CapitalContributionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'contribution_type' => $this->contribution_type,
            'amount' => (float) $this->amount,
            'value_description' => $this->value_description,
            'transaction_date' => $this->transaction_date?->format('Y-m-d'),
            'evidence_reference' => $this->evidence_reference,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
