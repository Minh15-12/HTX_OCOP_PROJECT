<?php

namespace Modules\Finance\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SurplusDistributionPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'plan_code' => $this->plan_code,
            'financial_year' => $this->financial_year,
            'total_surplus' => (float) $this->total_surplus,
            'distributable_surplus' => (float) $this->distributable_surplus,
            'capital_weight' => (float) $this->capital_weight,
            'service_usage_weight' => (float) $this->service_usage_weight,
            'status' => $this->status,
            'created_by' => $this->created_by,
            'creator_name' => $this->creator?->full_name,
            'approved_by' => $this->approved_by,
            'approver_name' => $this->approver?->full_name,
            'allocations' => SurplusDistributionAllocationResource::collection($this->whenLoaded('allocations')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
