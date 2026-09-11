<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateLotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'harvest_id' => ['required', 'uuid', 'exists:harvests,id'],
            'quantity' => ['nullable', 'numeric', 'gt:0'],
            'unit' => ['nullable', 'string', 'max:30'],
            'custom_lot_code' => ['nullable', 'string', 'max:100'],
            'source_information' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'harvest_id.required' => 'Bản ghi thu hoạch là bắt buộc',
            'quantity.gt' => 'Sản lượng lô hàng phải lớn hơn 0',
        ];
    }
}
