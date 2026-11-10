<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectFarmingLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'rejection_reason.required' => 'Lý do từ chối thẩm định nhật ký canh tác là bắt buộc',
            'rejection_reason.min' => 'Lý do từ chối phải có tối thiểu 5 ký tự',
        ];
    }
}
