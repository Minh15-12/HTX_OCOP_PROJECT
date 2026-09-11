<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductionUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'crop' => ['required', 'string', 'max:100'],
            'area' => ['required', 'numeric', 'gt:0'],
            'location' => ['nullable', 'array'],
            'registration_information' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'unit_code.required' => 'Mã vùng sản xuất không được để trống',
            'name.required' => 'Tên vùng sản xuất là bắt buộc',
            'crop.required' => 'Tên loại cây trồng chính là bắt buộc',
            'area.required' => 'Diện tích vùng sản xuất là bắt buộc',
            'area.gt' => 'Diện tích phải lớn hơn 0',
        ];
    }
}
