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
            'expected_end_date' => ['required', 'date', 'after:start_date'],
            'plan_information' => ['nullable', 'array'],
            'seed_supplier' => ['nullable', 'string', 'max:255'],
            'seedling_standard_checklist' => ['nullable', 'array'],
            'buyer_contract_info' => ['nullable', 'array'],
            'puc_quota_kg' => ['nullable', 'numeric', 'min:0'],
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
            'expected_end_date.after' => 'Ngày kết thúc dự kiến phải lớn hơn ngày bắt đầu',
        ];
    }
}
