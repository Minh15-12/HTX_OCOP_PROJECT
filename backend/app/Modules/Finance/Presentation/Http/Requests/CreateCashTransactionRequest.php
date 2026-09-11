<?php

namespace Modules\Finance\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCashTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_type' => ['required', 'string', 'in:INCOME,EXPENSE'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'transaction_date' => ['required', 'date'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'payer_payee' => ['nullable', 'string', 'max:255'],
            'member_id' => ['nullable', 'uuid', 'exists:members,id'],
            'evidence_reference' => ['nullable', 'array'],
            'custom_voucher_number' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_type.required' => 'Loại giao dịch (INCOME/EXPENSE) là bắt buộc',
            'amount.gt' => 'Số tiền giao dịch phải lớn hơn 0',
            'transaction_date.required' => 'Ngày giao dịch là bắt buộc',
            'category.required' => 'Danh mục giao dịch thu/chi là bắt buộc',
        ];
    }
}
