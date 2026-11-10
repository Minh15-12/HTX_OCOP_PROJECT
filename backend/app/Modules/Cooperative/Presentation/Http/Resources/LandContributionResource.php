<?php

namespace Modules\Cooperative\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LandContributionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contribution_id' => $this->contribution_id,
            'member_id' => $this->contribution?->member_id,
            'member_name' => $this->contribution?->member?->identity_information['full_name'] ?? null,
            'land_certificate_no' => $this->land_certificate_no,
            'plot_number' => $this->plot_number,
            'map_sheet_number' => $this->map_sheet_number,
            'land_area_sqm' => (float) $this->land_area_sqm,
            'land_use_type' => $this->land_use_type,
            'appraised_unit_price' => (float) $this->appraised_unit_price,
            'total_land_value' => (float) $this->total_land_value,
            'cadastral_status' => $this->cadastral_status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
