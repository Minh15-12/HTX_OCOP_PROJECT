<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCropSeasonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'production_unit_id' => ['required', 'uuid', 'exists:production_units,id'],
            'name' => ['required', 'string', 'max:255'],
            'crop' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'expected_end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'plan_information' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'production_unit_id.required' => 'Vùng sản xuất là bắt buộc',
            'name.required' => 'Tên mùa vụ là bắt buộc',
            'crop.required' => 'Tên cây trồng mùa vụ là bắt buộc',
            'start_date.required' => 'Ngày bắt đầu mùa vụ là bắt buộc',
            'expected_end_date.required' => 'Ngày kết thúc dự kiến là bắt buộc',
            'expected_end_date.after_or_equal' => 'Ngày kết thúc dự kiến phải lớn hơn hoặc bằng ngày bắt đầu',
        ];
    }
}
