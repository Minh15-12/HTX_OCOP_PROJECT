<?php

namespace Modules\Cooperative\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCapitalContributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contribution_type' => ['required', 'string', 'in:INITIAL,ADDITIONAL,LAND,ASSET'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'transaction_date' => ['required', 'date'],
            'value_description' => ['nullable', 'string', 'max:1000'],
            'evidence_reference' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'contribution_type.required' => 'Loại hình góp vốn không được để trống',
            'contribution_type.in' => 'Loại góp vốn hợp lệ: INITIAL, ADDITIONAL, LAND, ASSET',
            'amount.required' => 'Vui lòng nhập số tiền góp vốn',
            'amount.gt' => 'Số tiền góp vốn phải lớn hơn 0',
            'transaction_date.required' => 'Vui lòng nhập ngày thực hiện giao dịch',
        ];
    }
}
