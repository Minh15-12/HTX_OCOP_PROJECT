<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCriteriaVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'version_code' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'effective_from' => ['nullable', 'date'],
            'effective_to' => ['nullable', 'date', 'after_or_equal:effective_from'],
            'source_reference' => ['nullable', 'array'],
        ];
    }
}
