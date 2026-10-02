<?php

namespace Modules\Cooperative\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCapitalContributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contribution_type' => ['required', 'string', 'in:INITIAL,ADDITIONAL,LAND,ASSET,TIEN_MAT,CHUYEN_KHOAN,QUYEN_SU_DUNG_DAT,HIEN_VAT,MAY_MOC_THIET_BI'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'transaction_date' => ['required', 'date'],
            'value_description' => ['nullable', 'string', 'max:1000'],
            'evidence_reference' => ['nullable'],
            'land_certificate_no' => ['nullable', 'string', 'max:100'],
            'plot_number' => ['nullable', 'string', 'max:50'],
            'map_sheet_number' => ['nullable', 'string', 'max:50'],
            'land_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'land_use_type' => ['nullable', 'string', 'max:100'],
            'appraised_unit_price' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'contribution_type.required' => 'Loại hình góp vốn không được để trống',
            'contribution_type.in' => 'Loại góp vốn hợp lệ: INITIAL, ADDITIONAL, LAND, ASSET',
            'amount.required' => 'Vui lòng nhập số tiền góp vốn',
            'amount.gt' => 'Số tiền góp vốn phải lớn hơn 0',
            'transaction_date.required' => 'Vui lòng nhập ngày thực hiện giao dịch',
        ];
    }
}
