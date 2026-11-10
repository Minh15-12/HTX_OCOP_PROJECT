<?php

namespace Modules\Agriculture\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FarmingLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_uuid' => $this->client_uuid,
            'status' => $this->status ?? 'VERIFIED',
            'is_backdated' => (bool) $this->is_backdated,
            'crop_season_id' => $this->crop_season_id,
            'crop_season_name' => $this->cropSeason?->name,
            'plot_id' => $this->plot_id,
            'plot_code' => $this->plot?->plot_code,
            'plot_name' => $this->plot?->name ?? $this->plot?->plot_code,
            'activity_type' => $this->activity_type,
            'fertigation_method' => $this->fertigation_method,
            'ec_solution' => $this->ec_solution ? (float) $this->ec_solution : null,
            'ec_drain' => $this->ec_drain ? (float) $this->ec_drain : null,
            'ph_solution' => $this->ph_solution ? (float) $this->ph_solution : null,
            'tank_composition' => $this->tank_composition,
            'pest_target' => $this->pest_target,
            'pest_density' => $this->pest_density,
            'active_ingredient' => $this->active_ingredient,
            'resistance_group' => $this->resistance_group,
            'material_lot_number' => $this->material_lot_number,
            'material_export_slip_code' => $this->material_export_slip_code,
            'biocontrol_agent_name' => $this->biocontrol_agent_name,
            'biocontrol_release_rate' => $this->biocontrol_release_rate,
            'water_volume_liters' => $this->water_volume_liters ? (float) $this->water_volume_liters : null,
            'application_equipment' => $this->application_equipment,
            'is_phi_cleared' => (bool) $this->is_phi_cleared,
            'activity_date' => $this->activity_date?->format('Y-m-d'),
            'description' => $this->description,
            'voice_raw_text' => $this->voice_raw_text,
            'performed_by' => $this->performed_by,
            'performer_name' => $this->performer?->full_name,
            'verified_by' => $this->verified_by,
            'verifier_name' => $this->verifier?->full_name,
            'verified_at' => $this->verified_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
            'hash_sha256' => $this->hash_sha256,
            'prev_hash' => $this->prev_hash,
            'attachment_reference' => $this->attachment_reference,
            'material_id' => $this->material_id,
            'material_name' => $this->material?->name,
            'material_batch_number' => $this->material_batch_number,
            'quantity_applied' => $this->quantity_applied ? (float) $this->quantity_applied : null,
            'unit' => $this->unit,
            'phi_days' => $this->phi_days,
            'gps_latitude' => $this->gps_latitude ? (float) $this->gps_latitude : null,
            'gps_longitude' => $this->gps_longitude ? (float) $this->gps_longitude : null,
            'gps_distance_to_edge_meters' => $this->gps_distance_to_edge_meters ? (float) $this->gps_distance_to_edge_meters : null,
            'is_gps_verified' => (bool) $this->is_gps_verified,
            'items' => FarmingLogItemResource::collection($this->whenLoaded('items')),
            'material_usages_count' => $this->materialUsages ? $this->materialUsages->count() : 0,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
