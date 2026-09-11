<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateMaterialUsageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'material_id' => ['required', 'uuid', 'exists:materials,id'],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'unit' => ['required', 'string', 'max:30'],
            'batch_reference' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'material_id.required' => 'Vui lòng chọn vật tư sử dụng',
            'quantity.required' => 'Số lượng vật tư là bắt buộc',
            'quantity.gt' => 'Số lượng sử dụng phải lớn hơn 0',
            'unit.required' => 'Đơn vị tính là bắt buộc',
        ];
    }
}
