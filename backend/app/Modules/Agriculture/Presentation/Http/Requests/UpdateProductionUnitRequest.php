<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductionUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'crop' => ['sometimes', 'string', 'max:100'],
            'area' => ['sometimes', 'numeric', 'gt:0'],
            'location' => ['nullable', 'array'],
            'status' => ['sometimes', 'string', 'in:ACTIVE,PREPARING,FALLOW,INACTIVE'],
            'registration_information' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'area.gt' => 'Diện tích phải lớn hơn 0',
            'status.in' => 'Trạng thái vùng sản xuất không hợp lệ',
        ];
    }
}
