<?php

namespace Modules\Cooperative\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identity_information' => ['nullable', 'array'],
            'identity_information.full_name' => ['sometimes', 'string', 'max:255'],
            'identity_information.citizen_id' => ['nullable', 'string', 'max:50'],
            'identity_information.phone_number' => ['nullable', 'string', 'max:30'],
            'identity_information.address' => ['nullable', 'string', 'max:500'],
            'member_type' => ['nullable', 'string', 'in:OFFICIAL,ASSOCIATED'],
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'admission_date' => ['nullable', 'date'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
