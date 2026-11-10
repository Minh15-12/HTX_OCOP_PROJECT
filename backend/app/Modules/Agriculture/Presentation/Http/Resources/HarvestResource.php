<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HarvestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'crop_season_id' => $this->crop_season_id,
            'season_name' => $this->cropSeason?->name,
            'plot_id' => $this->plot_id,
            'plot_code' => $this->plot?->plot_code,
            'stage_number' => $this->stage_number ?? 1,
            'harvest_date' => $this->harvest_date?->format('Y-m-d'),
            'last_spray_date' => $this->last_spray_date?->format('Y-m-d'),
            'last_active_ingredient' => $this->last_active_ingredient,
            'days_since_last_spray' => $this->days_since_last_spray,
            'weighing_slip_code' => $this->weighing_slip_code,
            'quantity' => (float) $this->quantity,
            'quantity_kg' => (float) $this->quantity,
            'rejection_weight_kg' => (float) ($this->rejection_weight_kg ?? 0),
            'unit' => $this->unit,
            'quality_information' => $this->quality_information,
            'kcs_status' => $this->kcs_status ?? 'PENDING_KCS',
            'kcs_gate_check' => $this->kcs_gate_check,
            'kcs_quick_lab' => $this->kcs_quick_lab,
            'grade' => $this->grade ?? 'GRADE_B',
            'quality_grade' => $this->grade ?? 'GRADE_B',
            'grade_a_kg' => (float) $this->grade_a_kg,
            'grade_b_kg' => (float) $this->grade_b_kg,
            'reject_kg' => (float) $this->reject_kg,
            'brix_level' => $this->brix_level ? (float) $this->brix_level : null,
            'uniformity_rate' => $this->uniformity_rate ? (float) $this->uniformity_rate : null,
            'plot_name' => $this->plot?->name ?? 'Thửa '.($this->plot?->plot_code ?? ''),
            'harvest_code' => 'TH-'.strtoupper(substr(str_replace('-', '', $this->id), 0, 8)),
            'is_phi_cleared' => (bool) ($this->kcs_gate_check['passed'] ?? true),
            'lot_id' => $this->lot_id,
            'lot_code' => $this->lot?->lot_code,
            'is_over_quota' => (bool) ($this->is_over_quota ?? false),
            'quota_excess_kg' => (float) ($this->quota_excess_kg ?? 0),
            'quota_audit_status' => $this->quota_audit_status ?? 'APPROVED',
            'quota_audit_note' => $this->quota_audit_note,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
