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
            'activity_type' => ['required', 'string', 'in:SPRAYING,FERTILIZING,PLOWING,WEEDING,HARVESTING,IRRIGATION,PRUNING'],
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
