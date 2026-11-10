<?php

namespace Modules\Inventory\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateStockIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'issue_date' => ['required', 'date'],
            'member_id' => ['nullable', 'uuid', 'exists:members,id'],
            'crop_season_id' => ['nullable', 'uuid', 'exists:crop_seasons,id'],
            'is_credit' => ['nullable', 'boolean'],
            'purpose' => ['nullable', 'string', 'max:255'],
            'custom_issue_number' => ['nullable', 'string', 'max:100'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.material_id' => ['required', 'uuid', 'exists:materials,id'],
            'lines.*.quantity' => ['required', 'numeric', 'gt:0'],
            'lines.*.unit_price' => ['nullable', 'numeric', 'gte:0'],
            'lines.*.batch_code' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'issue_date.required' => 'Ngày xuất kho là bắt buộc',
            'lines.required' => 'Danh sách chi tiết xuất kho là bắt buộc',
            'lines.min' => 'Phiếu xuất kho phải chứa ít nhất 1 dòng vật tư',
            'lines.*.material_id.required' => 'Vật tư là bắt buộc cho mỗi dòng',
            'lines.*.quantity.gt' => 'Số lượng xuất phải lớn hơn 0',
        ];
    }
}
