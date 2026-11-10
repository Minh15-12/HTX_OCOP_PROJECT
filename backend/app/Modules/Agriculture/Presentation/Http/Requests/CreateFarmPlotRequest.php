<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateFarmPlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plot_code' => ['required', 'string', 'max:50'],
            'area' => ['required', 'numeric', 'gt:0'],
            'land_relation' => ['nullable', 'array'],
            'national_cadastral_code' => ['nullable', 'string', 'max:100'],
            'land_sheet_number' => ['nullable', 'string', 'max:50'],
            'land_parcel_number' => ['nullable', 'string', 'max:50'],
            'substrate_bag_count' => ['nullable', 'integer', 'min:0'],
            'planting_density_per_sqm' => ['nullable', 'numeric', 'min:0'],
            'greenhouse_type' => ['nullable', 'string', 'in:HIGH_TECH_GREENHOUSE,NET_HOUSE,OPEN_FIELD'],
            'geometry_geojson' => ['nullable', 'array'],
            'vn2000_coordinates' => ['nullable', 'array'],
            'max_yield_rate_per_sqm' => ['nullable', 'numeric', 'min:0'],
            'land_contract_expired_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'plot_code.required' => 'Mã thửa đất không được để trống',
            'area.required' => 'Diện tích thửa đất là bắt buộc',
            'area.gt' => 'Diện tích phải lớn hơn 0',
        ];
    }
}
