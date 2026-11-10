<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FarmPlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'production_unit_id' => $this->production_unit_id,
            'unit_code' => $this->productionUnit?->unit_code,
            'unit_name' => $this->productionUnit?->name,
            'plot_code' => $this->plot_code,
            'national_cadastral_code' => $this->national_cadastral_code,
            'land_sheet_number' => $this->land_sheet_number,
            'land_parcel_number' => $this->land_parcel_number,
            'substrate_bag_count' => $this->substrate_bag_count,
            'planting_density_per_sqm' => $this->planting_density_per_sqm ? (float) $this->planting_density_per_sqm : null,
            'greenhouse_type' => $this->greenhouse_type,
            'area' => (float) $this->area,
            'land_relation' => $this->land_relation,
            'geometry_geojson' => $this->geometry_geojson,
            'vn2000_coordinates' => $this->vn2000_coordinates,
            'max_yield_rate_per_sqm' => $this->max_yield_rate_per_sqm ? (float) $this->max_yield_rate_per_sqm : 5.0,
            'max_harvest_quota_kg' => $this->calculateHarvestQuota(),
            'land_contract_expired_at' => $this->land_contract_expired_at?->format('Y-m-d'),
            'is_contract_expired' => $this->land_contract_expired_at ? now()->greaterThan($this->land_contract_expired_at) : false,
            'status' => $this->status,
            'quarantine_until' => $this->quarantine_until?->format('Y-m-d'),
            'is_in_quarantine' => $this->isInQuarantine(),
            'assignments' => MemberPlotAssignmentResource::collection($this->whenLoaded('assignments')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
