<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateHarvestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'crop_season_id' => ['required', 'uuid', 'exists:crop_seasons,id'],
            'plot_id' => ['required', 'uuid', 'exists:farm_plots,id'],
            'harvest_date' => ['required', 'date'],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'unit' => ['required', 'string', 'max:30'],
            'quality_information' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'crop_season_id.required' => 'Mùa vụ thu hoạch là bắt buộc',
            'plot_id.required' => 'Thửa đất thu hoạch là bắt buộc',
            'harvest_date.required' => 'Ngày thu hoạch là bắt buộc',
            'quantity.required' => 'Sản lượng thu hoạch là bắt buộc',
            'quantity.gt' => 'Sản lượng thu hoạch phải lớn hơn 0',
            'unit.required' => 'Đơn vị tính sản lượng là bắt buộc',
        ];
    }
}
