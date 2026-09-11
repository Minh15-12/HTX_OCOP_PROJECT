<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIndicatorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'mandatory' => ['sometimes', 'boolean'],
            'evidence_requirement' => ['nullable', 'array'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
