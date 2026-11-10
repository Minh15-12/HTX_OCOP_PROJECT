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
            // Core identity
            'identity_information' => ['nullable', 'array'],
            'identity_information.full_name' => ['sometimes', 'string', 'max:255'],
            'identity_information.citizen_id' => ['nullable', 'string', 'max:50'],
            'identity_information.phone_number' => ['nullable', 'string', 'max:30'],
            'identity_information.address' => ['nullable', 'string', 'max:500'],
            'identity_information.gender' => ['nullable', 'string', 'max:20'],
            'identity_information.date_of_birth' => ['nullable', 'date'],
            'identity_information.ethnicity' => ['nullable', 'string', 'max:50'],

            // Nested Emergency Contact
            'identity_information.emergency_contact' => ['nullable', 'array'],
            'identity_information.emergency_contact.name' => ['nullable', 'string', 'max:255'],
            'identity_information.emergency_contact.phone' => ['nullable', 'string', 'max:30'],
            'identity_information.emergency_contact.relationship' => ['nullable', 'string', 'max:100'],

            // Nested Bank Account Info
            'identity_information.bank_account_info' => ['nullable', 'array'],
            'identity_information.bank_account_info.bank_name' => ['nullable', 'string', 'max:255'],
            'identity_information.bank_account_info.account_number' => ['nullable', 'string', 'max:100'],
            'identity_information.bank_account_info.account_holder' => ['nullable', 'string', 'max:255'],

            // Health & Family Status
            'identity_information.health_status' => ['nullable', 'string', 'max:255'],
            'identity_information.family_situation' => ['nullable', 'string', 'max:500'],

            // Beneficiary
            'identity_information.beneficiary_info' => ['nullable', 'array'],
            'identity_information.beneficiary_info.name' => ['nullable', 'string', 'max:255'],
            'identity_information.beneficiary_info.relationship' => ['nullable', 'string', 'max:100'],
            'identity_information.beneficiary_info.phone' => ['nullable', 'string', 'max:30'],

            // Fallback for top-level emergency_contact & bank_account_info
            'emergency_contact' => ['nullable', 'array'],
            'emergency_contact.name' => ['nullable', 'string', 'max:255'],
            'emergency_contact.phone' => ['nullable', 'string', 'max:30'],
            'emergency_contact.relationship' => ['nullable', 'string', 'max:100'],
            'bank_account_info' => ['nullable', 'array'],
            'bank_account_info.bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_info.account_number' => ['nullable', 'string', 'max:100'],
            'bank_account_info.account_holder' => ['nullable', 'string', 'max:255'],

            // Membership & Financial fields
            'member_type' => ['nullable', 'string', 'in:OFFICIAL,ASSOCIATED,CHINH_THUC,LIEN_KET,CAPITAL_ASSOCIATE,LABOR_ASSOCIATE'],
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'admission_date' => ['nullable', 'date'],
            'committed_capital' => ['nullable', 'numeric', 'min:0'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:PROSPECTIVE,ACTIVE,INACTIVE,SUSPENDED,TERMINATED'],
        ];
    }
}
