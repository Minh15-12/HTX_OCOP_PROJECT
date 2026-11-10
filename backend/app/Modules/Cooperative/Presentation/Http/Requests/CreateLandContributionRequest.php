<?php

namespace Modules\Cooperative\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateLandContributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'land_certificate_no' => ['required', 'string', 'max:50'],
            'plot_number' => ['required', 'string', 'max:20'],
            'map_sheet_number' => ['required', 'string', 'max:20'],
            'land_area_sqm' => ['required', 'numeric', 'min:0.01'],
            'land_use_type' => ['required', 'string', 'max:50'],
            'appraised_unit_price' => ['required', 'numeric', 'min:0'],
            'total_land_value' => ['nullable', 'numeric', 'min:0'],
            'cadastral_status' => ['nullable', 'string', 'in:PENDING,NOTARIZED,REGISTERED_CHANGE'],
        ];
    }

    public function messages(): array
    {
        return [
            'land_certificate_no.required' => 'Số giấy chứng nhận QSDĐ (sổ đỏ) là bắt buộc',
            'plot_number.required' => 'Số thửa đất là bắt buộc',
            'map_sheet_number.required' => 'Số tờ bản đồ là bắt buộc',
            'land_area_sqm.required' => 'Diện tích đất góp là bắt buộc',
            'land_use_type.required' => 'Loại đất là bắt buộc',
            'appraised_unit_price.required' => 'Đơn giá thẩm định là bắt buộc',
        ];
    }
}
