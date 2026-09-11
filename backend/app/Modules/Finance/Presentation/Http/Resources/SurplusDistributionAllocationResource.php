<?php

namespace Modules\Finance\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SurplusDistributionAllocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'plan_id' => $this->plan_id,
            'member_id' => $this->member_id,
            'member_name' => $this->member?->identity_information['full_name'] ?? null,
            'capital_contribution_snapshot' => (float) $this->capital_contribution_snapshot,
            'service_usage_snapshot' => (float) $this->service_usage_snapshot,
            'capital_share_amount' => (float) $this->capital_share_amount,
            'service_share_amount' => (float) $this->service_share_amount,
            'total_allocated_amount' => (float) $this->total_allocated_amount,
        ];
    }
}
