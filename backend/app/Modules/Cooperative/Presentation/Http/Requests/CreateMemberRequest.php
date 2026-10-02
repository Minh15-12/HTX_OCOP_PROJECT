<?php

namespace Modules\Cooperative\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_code' => ['required', 'string', 'max:50'],
            'identity_information' => ['required', 'array'],
            'identity_information.full_name' => ['required', 'string', 'max:255'],
            'identity_information.citizen_id' => ['nullable', 'string', 'max:50'],
            'identity_information.phone_number' => ['nullable', 'string', 'max:30'],
            'identity_information.address' => ['nullable', 'string', 'max:500'],
            'member_type' => ['nullable', 'string', 'in:OFFICIAL,ASSOCIATED,CHINH_THUC,LIEN_KET,CAPITAL_ASSOCIATE,LABOR_ASSOCIATE'],
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'admission_date' => ['nullable', 'date'],
            'cooperative_id' => ['nullable', 'uuid', 'exists:cooperatives,id'],
            'committed_capital' => ['nullable', 'numeric', 'min:0'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'member_code.required' => 'Mã xã viên không được để trống',
            'identity_information.required' => 'Vui lòng cung cấp thông tin định danh xã viên',
            'identity_information.full_name.required' => 'Họ và tên xã viên là bắt buộc',
            'member_type.in' => 'Loại xã viên phải là OFFICIAL hoặc ASSOCIATED',
        ];
    }
}
