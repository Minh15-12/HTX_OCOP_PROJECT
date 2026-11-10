<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFarmingLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'activity_type' => ['sometimes', 'string', 'in:SPRAYING,FERTILIZING,FERTILIZATION,PLOWING,LAND_PREPARATION,WEEDING,HARVESTING,HARVEST,IRRIGATION,PRUNING,CARE,MONITORING,PLANTING,PEST_CONTROL,SOWING,OTHER'],
            'activity_date' => ['sometimes', 'date'],
            'description' => ['nullable', 'string', 'max:2000'],
            'performed_by' => ['nullable', 'uuid', 'exists:users,id'],
            'attachment_reference' => ['nullable', 'array'],
            'material_id' => ['nullable', 'uuid', 'exists:materials,id'],
            'material_batch_number' => ['nullable', 'string', 'max:100'],
            'quantity_applied' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:30'],
            'phi_days' => ['nullable', 'integer', 'min:0'],
            'gps_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'gps_longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
