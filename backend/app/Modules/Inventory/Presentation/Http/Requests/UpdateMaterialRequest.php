<?php

namespace Modules\Inventory\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:100'],
            'unit' => ['sometimes', 'string', 'max:30'],
            'safety_information' => ['nullable', 'array'],
            'reorder_threshold' => ['nullable', 'numeric', 'gte:0'],
            'status' => ['nullable', 'string', 'in:ACTIVE,INACTIVE'],
        ];
    }
}
