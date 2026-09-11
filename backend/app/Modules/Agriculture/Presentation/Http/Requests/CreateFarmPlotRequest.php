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
