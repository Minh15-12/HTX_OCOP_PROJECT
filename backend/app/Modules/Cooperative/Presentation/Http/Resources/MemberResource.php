<?php

namespace Modules\Cooperative\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $contributedCapital = (float) CapitalContributionModel::where('member_id', $this->id)
            ->whereIn('status', ['PAID', 'APPROVED', 'COMPLETED'])
            ->sum('amount');

        if ($contributedCapital == 0 && is_array($this->identity_information) && isset($this->identity_information['contributed_capital'])) {
            $contributedCapital = (float) $this->identity_information['contributed_capital'];
        }

        $committedCapital = (float) ($this->committed_capital ?: ($contributedCapital > 0 ? $contributedCapital : 30000000));
        $remainingCapital = max(0, $committedCapital - $contributedCapital);

        $totalCoopCapital = (float) CapitalContributionModel::whereHas('member', function ($q) {
            $q->where('cooperative_id', $this->cooperative_id);
        })->whereIn('status', ['PAID', 'APPROVED', 'COMPLETED'])->sum('amount');

        if ($totalCoopCapital == 0) {
            $totalCoopCapital = (float) MemberModel::where('cooperative_id', $this->cooperative_id)->sum('committed_capital') ?: 1;
        }

        $ownershipPercentage = $totalCoopCapital > 0 ? round(($contributedCapital / $totalCoopCapital) * 100, 2) : 0;

        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'member_code' => $this->member_code,
            'identity_information' => $this->identity_information,
            'member_type' => $this->member_type,
            'is_foreign_investor' => (bool) $this->is_foreign_investor,
            'committed_capital' => $committedCapital,
            'contributed_capital' => $contributedCapital,
            'remaining_capital' => $remainingCapital,
            'ownership_percentage' => $ownershipPercentage,
            'capital_status' => ($contributedCapital >= $committedCapital && $committedCapital > 0) ? 'DU_VON' : 'CHUA_DU',
            'commitment_deadline' => $this->commitment_deadline?->format('Y-m-d'),
            'credit_limit' => (float) ($this->credit_limit ?? 0),
            'status' => $this->status,
            'user_id' => $this->user_id,
            'user_email' => $this->user?->email,
            'admission_date' => $this->admission_date?->format('Y-m-d'),
            'termination_date' => $this->termination_date?->format('Y-m-d'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
