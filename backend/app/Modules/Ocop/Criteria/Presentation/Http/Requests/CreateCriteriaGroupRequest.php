<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCriteriaGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
