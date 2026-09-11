<?php

namespace Modules\Ocop\Dossier\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveSelfAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'indicator_id' => ['required', 'uuid'],
            'score' => ['required', 'numeric', 'min:0', 'max:100'],
            'explanation' => ['nullable', 'string'],
        ];
    }
}
