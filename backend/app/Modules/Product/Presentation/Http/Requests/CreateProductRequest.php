<?php

namespace Modules\Product\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_code' => ['required', 'string', 'max:50'],
            'product_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'specification' => ['nullable'],
            'brand' => ['nullable', 'string', 'max:255'],
            'quality_information' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_code.required' => 'Mã sản phẩm không được để trống',
            'product_name.required' => 'Tên sản phẩm là bắt buộc',
            'category.required' => 'Danh mục sản phẩm là bắt buộc',
        ];
    }
}
