<?php

namespace Modules\Ocop\Evidence\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LinkEvidenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'indicator_id' => ['required', 'uuid'],
            'relevance' => ['nullable', 'string', 'max:50'],
            'note' => ['nullable', 'string'],
        ];
    }
}
