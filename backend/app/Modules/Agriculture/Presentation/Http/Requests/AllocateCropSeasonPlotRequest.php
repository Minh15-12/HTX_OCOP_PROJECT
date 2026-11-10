<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AllocateCropSeasonPlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plot_id' => ['required', 'uuid', 'exists:farm_plots,id'],
            'member_id' => ['nullable', 'uuid', 'exists:members,id'],
            'allocated_area' => ['required', 'numeric', 'min:0.01'],
            'crop_variety' => ['nullable', 'string', 'max:100'],
            'planting_date' => ['required', 'date'],
            'expected_harvest_start' => ['required', 'date', 'after_or_equal:planting_date'],
            'expected_harvest_end' => ['required', 'date', 'after:expected_harvest_start'],
            'target_yield_kg' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'plot_id.required' => 'Thửa đất là bắt buộc',
            'plot_id.exists' => 'Thửa đất không tồn tại trong hệ thống',
            'allocated_area.required' => 'Diện tích phân bổ là bắt buộc',
            'allocated_area.min' => 'Diện tích phân bổ phải lớn hơn 0',
            'planting_date.required' => 'Ngày xuống giống là bắt buộc',
            'expected_harvest_start.required' => 'Ngày bắt đầu thu hoạch dự kiến là bắt buộc',
            'expected_harvest_start.after_or_equal' => 'Ngày thu hoạch phải sau hoặc cùng ngày xuống giống',
            'expected_harvest_end.required' => 'Ngày kết thúc thu hoạch là bắt buộc',
            'expected_harvest_end.after' => 'Ngày kết thúc thu hoạch phải sau ngày bắt đầu thu hoạch',
        ];
    }
}
