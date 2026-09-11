<?php

namespace Modules\Inventory\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateStockReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receipt_date' => ['required', 'date'],
            'custom_receipt_number' => ['nullable', 'string', 'max:100'],
            'supplier_information' => ['nullable', 'array'],
            'evidence_reference' => ['nullable', 'array'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.material_id' => ['required', 'uuid', 'exists:materials,id'],
            'lines.*.quantity' => ['required', 'numeric', 'gt:0'],
            'lines.*.unit_price' => ['nullable', 'numeric', 'gte:0'],
            'lines.*.batch_code' => ['nullable', 'string', 'max:100'],
            'lines.*.expiry_date' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'receipt_date.required' => 'Ngày nhập kho là bắt buộc',
            'lines.required' => 'Danh sách chi tiết nhập kho là bắt buộc',
            'lines.min' => 'Phiếu nhập kho phải chứa ít nhất 1 dòng vật tư',
            'lines.*.material_id.required' => 'Vật tư là bắt buộc cho mỗi dòng',
            'lines.*.quantity.gt' => 'Số lượng nhập phải lớn hơn 0',
        ];
    }
}
