<?php

namespace Modules\Cooperative\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StatusTransitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_status' => ['required', 'string', 'in:ACTIVE,PENDING_TERMINATION,TERMINATED'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'target_status.required' => 'Vui lòng cung cấp trạng thái mục tiêu',
            'target_status.in' => 'Trạng thái không hợp lệ. Cho phép: ACTIVE, PENDING_TERMINATION, TERMINATED',
        ];
    }
}
