<?php

namespace Modules\Cooperative\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CapitalContributionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $memberInfo = $this->relationLoaded('member') && $this->member ? [
            'id' => $this->member->id,
            'member_code' => $this->member->member_code,
            'full_name' => $this->member->identity_information['full_name'] ?? 'N/A',
            'phone_number' => $this->member->identity_information['phone_number'] ?? null,
            'member_type' => $this->member->member_type,
            'committed_capital' => (float) $this->member->committed_capital,
        ] : null;

        $landInfo = $this->relationLoaded('landContribution') && $this->landContribution ? [
            'id' => $this->landContribution->id,
            'land_certificate_no' => $this->landContribution->land_certificate_no,
            'plot_number' => $this->landContribution->plot_number,
            'map_sheet_number' => $this->landContribution->map_sheet_number,
            'land_area_sqm' => (float) $this->landContribution->land_area_sqm,
            'land_use_type' => $this->landContribution->land_use_type,
            'appraised_unit_price' => (float) $this->landContribution->appraised_unit_price,
            'total_land_value' => (float) $this->landContribution->total_land_value,
            'cadastral_status' => $this->landContribution->cadastral_status,
        ] : null;

        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'member' => $memberInfo,
            'contribution_type' => $this->contribution_type,
            'amount' => (float) $this->amount,
            'committed_amount' => (float) ($this->committed_amount ?? $this->amount),
            'actual_amount' => (float) ($this->actual_amount ?? $this->amount),
            'ownership_ratio' => (float) ($this->ownership_ratio ?? 0),
            'value_description' => $this->value_description,
            'transaction_date' => $this->transaction_date ? (is_string($this->transaction_date) ? $this->transaction_date : $this->transaction_date->format('Y-m-d')) : null,
            'certificate_code' => $this->certificate_code,
            'certificate_issue_date' => $this->certificate_issue_date ? (is_string($this->certificate_issue_date) ? $this->certificate_issue_date : $this->certificate_issue_date->format('Y-m-d')) : null,
            'issue_count' => (int) ($this->issue_count ?? 1),
            'qr_code_url' => $this->qr_code_url,
            'evidence_reference' => $this->evidence_reference,
            'land_contribution' => $landInfo,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
