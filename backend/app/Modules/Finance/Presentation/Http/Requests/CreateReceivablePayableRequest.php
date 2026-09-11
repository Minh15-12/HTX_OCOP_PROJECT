<?php

namespace Modules\Finance\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateReceivablePayableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'debt_type' => ['required', 'string', 'in:RECEIVABLE,PAYABLE'],
            'counterparty_type' => ['required', 'string', 'max:50'],
            'counterparty_name' => ['required', 'string', 'max:255'],
            'original_amount' => ['required', 'numeric', 'gt:0'],
            'due_date' => ['required', 'date'],
            'counterparty_id' => ['nullable', 'uuid'],
            'description' => ['nullable', 'string', 'max:1000'],
            'custom_debt_code' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'debt_type.required' => 'Loại công nợ (RECEIVABLE/PAYABLE) là bắt buộc',
            'counterparty_name.required' => 'Tên đối tác công nợ là bắt buộc',
            'original_amount.gt' => 'Số tiền nợ gốc phải lớn hơn 0',
            'due_date.required' => 'Hạn thanh toán là bắt buộc',
        ];
    }
}
