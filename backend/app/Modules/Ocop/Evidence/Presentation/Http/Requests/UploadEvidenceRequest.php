<?php

namespace Modules\Ocop\Evidence\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadEvidenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf,jpeg,jpg,png', 'max:51200'], // 50MB
            'title' => ['required', 'string', 'max:255'],
            'evidence_type' => ['required', 'string', 'in:CERTIFICATE,LAB_REPORT,PROCESS_PHOTO,LEGAL_DOCUMENT'],
        ];
    }
}
