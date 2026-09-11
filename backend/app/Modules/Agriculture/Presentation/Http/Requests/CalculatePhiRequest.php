<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CalculatePhiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'material_id' => ['required', 'uuid', 'exists:materials,id'],
            'application_date' => ['required', 'date'],
            'configured_phi_days' => ['nullable', 'integer', 'gte:0'],
            'source_reference' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'material_id.required' => 'Vui lòng chọn vật tư/thuốc BVTV tính toán PHI',
            'application_date.required' => 'Ngày phun/bón sử dụng vật tư là bắt buộc',
            'configured_phi_days.gte' => 'Số ngày cách ly cấu hình phải lớn hơn hoặc bằng 0',
        ];
    }
}
