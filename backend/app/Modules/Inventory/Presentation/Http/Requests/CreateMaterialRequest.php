<?php

namespace Modules\Inventory\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'unit' => ['required', 'string', 'max:30'],
            'safety_information' => ['nullable', 'array'],
            'reorder_threshold' => ['nullable', 'numeric', 'gte:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'sku.required' => 'Mã SKU vật tư không được để trống',
            'name.required' => 'Tên vật tư là bắt buộc',
            'category.required' => 'Danh mục vật tư là bắt buộc',
            'unit.required' => 'Đơn vị tính là bắt buộc',
        ];
    }
}
