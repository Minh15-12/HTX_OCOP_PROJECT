<?php

namespace Modules\Inventory\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateStockCountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'count_date' => ['required', 'date'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'scope' => ['nullable', 'array'],
            'custom_count_number' => ['nullable', 'string', 'max:100'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.material_id' => ['required', 'uuid', 'exists:materials,id'],
            'lines.*.actual_quantity' => ['required', 'numeric', 'gte:0'],
            'lines.*.reason' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'count_date.required' => 'Ngày kiểm kê kho là bắt buộc',
            'lines.required' => 'Danh sách chi tiết kiểm kê là bắt buộc',
            'lines.min' => 'Phiếu kiểm kê phải chứa ít nhất 1 dòng vật tư',
            'lines.*.material_id.required' => 'Vật tư là bắt buộc cho mỗi dòng',
            'lines.*.actual_quantity.gte' => 'Số lượng kiểm kê thực tế phải lớn hơn hoặc bằng 0',
        ];
    }
}
