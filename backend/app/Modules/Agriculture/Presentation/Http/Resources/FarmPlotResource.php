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
            'area' => (float) $this->area,
            'land_relation' => $this->land_relation,
            'status' => $this->status,
            'assignments' => MemberPlotAssignmentResource::collection($this->whenLoaded('assignments')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
