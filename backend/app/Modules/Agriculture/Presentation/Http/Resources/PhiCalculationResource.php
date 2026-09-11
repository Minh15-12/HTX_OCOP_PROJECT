<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PhiCalculationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'farming_log_id' => $this->farming_log_id,
            'material_id' => $this->material_id,
            'material_name' => $this->material?->name,
            'material_sku' => $this->material?->sku,
            'application_date' => $this->application_date?->format('Y-m-d'),
            'configured_phi_days' => $this->configured_phi_days,
            'safety_date' => $this->safety_date?->format('Y-m-d'),
            'status' => $this->status,
            'source_reference' => $this->source_reference,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
