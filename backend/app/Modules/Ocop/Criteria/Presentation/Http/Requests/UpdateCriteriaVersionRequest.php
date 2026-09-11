<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCriteriaVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'effective_from' => ['nullable', 'date'],
            'effective_to' => ['nullable', 'date', 'after_or_equal:effective_from'],
            'source_reference' => ['nullable', 'array'],
        ];
    }
}
