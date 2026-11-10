<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveCropSeasonBomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.material_id' => ['required', 'uuid', 'exists:materials,id'],
            'items.*.stage_phase' => ['nullable', 'string', 'max:50'],
            'items.*.standard_rate_per_sqm' => ['nullable', 'numeric', 'min:0'],
            'items.*.planned_quantity' => ['required', 'numeric', 'min:0.0001'],
            'items.*.estimated_unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.estimated_total_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.notes' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Danh mục vật tư dự toán là bắt buộc',
            'items.array' => 'Dữ liệu dự toán không đúng định dạng',
            'items.*.material_id.required' => 'Vật tư là bắt buộc',
            'items.*.material_id.exists' => 'Vật tư không tồn tại trong kho',
            'items.*.planned_quantity.required' => 'Khối lượng dự toán là bắt buộc',
            'items.*.planned_quantity.min' => 'Khối lượng dự toán phải lớn hơn 0',
        ];
    }
}
