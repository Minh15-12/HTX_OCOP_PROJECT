<?php

namespace Modules\Product\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_name' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:100'],
            'specification' => ['nullable', 'array'],
            'brand' => ['nullable', 'string', 'max:255'],
            'quality_information' => ['nullable', 'array'],
            'status' => ['nullable', 'string', 'in:ACTIVE,INACTIVE'],
        ];
    }
}
