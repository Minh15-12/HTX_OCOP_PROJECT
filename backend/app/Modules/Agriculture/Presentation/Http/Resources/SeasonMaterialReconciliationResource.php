<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeasonMaterialReconciliationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'crop_season_id' => $this->crop_season_id,
            'season_name' => $this->cropSeason?->name,
            'material_id' => $this->material_id,
            'material_name' => $this->material_name ?? $this->material?->name,
            'unit' => $this->unit,
            'opening_balance' => (float) $this->opening_balance,
            'received_from_coop' => (float) $this->received_from_coop,
            'used_in_logbook' => (float) $this->used_in_logbook,
            'actual_closing_balance' => (float) $this->actual_closing_balance,
            'calculated_balance' => (float) ($this->opening_balance + $this->received_from_coop - $this->used_in_logbook),
            'variance' => (float) $this->variance,
            'empty_packaging_returned' => (int) $this->empty_packaging_returned,
            'waste_disposal_slip_code' => $this->waste_disposal_slip_code,
            'reconciliation_notes' => $this->reconciliation_notes,
            'status' => $this->status,
            'reconciled_by' => $this->reconciled_by,
            'reconciler_name' => $this->reconciler?->full_name,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
