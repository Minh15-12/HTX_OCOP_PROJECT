<?php

namespace Modules\Finance\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateSurplusDistributionPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'financial_year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'total_surplus' => ['required', 'numeric', 'gt:0'],
            'distributable_surplus' => ['required', 'numeric', 'gt:0', 'lte:total_surplus'],
            'capital_weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'service_usage_weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'custom_plan_code' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'financial_year.required' => 'Năm tài chính là bắt buộc',
            'total_surplus.gt' => 'Tổng thặng dư phải lớn hơn 0',
            'distributable_surplus.lte' => 'Thặng dư phân phối không được vượt quá tổng thặng dư',
        ];
    }
}
