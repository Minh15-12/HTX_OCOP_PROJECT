<?php

namespace Modules\Ocop\Evidence\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyEvidenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:VERIFIED,REJECTED'],
            'reason' => ['nullable', 'required_if:status,REJECTED', 'string', 'max:1000'],
        ];
    }
}
