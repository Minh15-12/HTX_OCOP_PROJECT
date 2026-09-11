<?php

namespace Modules\Product\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttachProductLotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lot_id' => ['required', 'uuid', 'exists:lots,id'],
            'quantity' => ['nullable', 'numeric', 'gt:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'lot_id.required' => 'Vui lòng chọn lô sản phẩm để liên kết',
            'quantity.gt' => 'Sản lượng liên kết phải lớn hơn 0',
        ];
    }
}
