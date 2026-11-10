<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateFarmingLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'crop_season_id' => ['required', 'uuid', 'exists:crop_seasons,id'],
            'plot_id' => ['required', 'uuid', 'exists:farm_plots,id'],
            'activity_type' => ['required', 'string', 'in:SPRAYING,FERTILIZING,FERTILIZATION,PLOWING,LAND_PREPARATION,WEEDING,HARVESTING,HARVEST,IRRIGATION,PRUNING,CARE,MONITORING,PLANTING,PEST_CONTROL,SOWING,BIOCONTROL,IPM_SCOUTING,OTHER'],
            'fertigation_method' => ['nullable', 'string', 'max:50'],
            'ec_solution' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'ec_drain' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'ph_solution' => ['nullable', 'numeric', 'min:0', 'max:14'],
            'tank_composition' => ['nullable', 'array'],
            'pest_target' => ['nullable', 'string', 'max:255'],
            'pest_density' => ['nullable', 'string', 'max:100'],
            'active_ingredient' => ['nullable', 'string', 'max:255'],
            'resistance_group' => ['nullable', 'string', 'max:50'],
            'material_lot_number' => ['nullable', 'string', 'max:100'],
            'material_export_slip_code' => ['nullable', 'string', 'max:100'],
            'biocontrol_agent_name' => ['nullable', 'string', 'max:100'],
            'biocontrol_release_rate' => ['nullable', 'string', 'max:100'],
            'water_volume_liters' => ['nullable', 'numeric', 'min:0'],
            'application_equipment' => ['nullable', 'string', 'max:100'],
            'activity_date' => ['required', 'date'],
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
            'gps_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'gps_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'client_uuid' => ['nullable', 'string', 'max:100'],
            'voice_raw_text' => ['nullable', 'string', 'max:2000'],
            'items' => ['nullable', 'array'],
            'items.*.material_id' => ['nullable', 'uuid', 'exists:materials,id'],
            'items.*.material_name' => ['required_with:items', 'string', 'max:255'],
            'items.*.item_type' => ['nullable', 'string', 'in:PESTICIDE,FERTILIZER,BIOCONTROL,OTHER'],
            'items.*.active_ingredient' => ['nullable', 'string', 'max:255'],
            'items.*.resistance_group' => ['nullable', 'string', 'max:50'],
            'items.*.quantity_applied' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.unit' => ['required_with:items', 'string', 'max:50'],
            'items.*.phi_days' => ['nullable', 'integer', 'min:0'],
            'items.*.material_lot_number' => ['nullable', 'string', 'max:100'],
            'items.*.material_export_slip_code' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'crop_season_id.required' => 'Mùa vụ sản xuất là bắt buộc',
            'plot_id.required' => 'Thửa đất canh tác là bắt buộc',
            'activity_type.required' => 'Loại hoạt động canh tác là bắt buộc',
            'activity_type.in' => 'Loại hoạt động canh tác không hợp lệ. Cho phép: SPRAYING, FERTILIZING, PLOWING, WEEDING, HARVESTING, IRRIGATION, PRUNING',
            'activity_date.required' => 'Ngày thực hiện hoạt động là bắt buộc',
        ];
    }
}
