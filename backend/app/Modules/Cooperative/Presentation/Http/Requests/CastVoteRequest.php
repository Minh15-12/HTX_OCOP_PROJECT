<?php

namespace Modules\Cooperative\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CastVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resolution_code' => ['required', 'string', 'max:100'],
            'resolution_type' => ['nullable', 'string', 'in:REGULAR,CRITICAL,THUONG,TRONG_YEU'],
            'choice' => ['required', 'string', 'in:FOR,AGAINST,ABSTAIN,DONG_Y,KHONG_DONG_Y,TRANG'],
            'weight' => ['nullable', 'numeric', 'min:0.0001'],
        ];
    }

    public function messages(): array
    {
        return [
            'resolution_code.required' => 'Mã nghị quyết biểu quyết là bắt buộc',
            'choice.required' => 'Lựa chọn biểu quyết là bắt buộc (FOR, AGAINST, ABSTAIN)',
        ];
    }
}
