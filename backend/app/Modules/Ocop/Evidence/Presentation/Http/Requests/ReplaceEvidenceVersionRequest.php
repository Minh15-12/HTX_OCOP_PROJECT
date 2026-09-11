<?php

namespace Modules\Ocop\Evidence\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReplaceEvidenceVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf,jpeg,jpg,png', 'max:51200'],
            'replacement_reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
