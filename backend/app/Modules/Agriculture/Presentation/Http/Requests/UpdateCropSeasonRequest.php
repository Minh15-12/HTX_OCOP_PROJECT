<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCropSeasonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'crop' => ['sometimes', 'string', 'max:100'],
            'start_date' => ['sometimes', 'date'],
            'expected_end_date' => ['sometimes', 'date'],
            'status' => ['nullable', 'string', 'in:PLANNED,ACTIVE,HARVESTING,CANCELLED'],
            'plan_information' => ['nullable', 'array'],
            'seed_supplier' => ['nullable', 'string', 'max:255'],
            'seedling_standard_checklist' => ['nullable', 'array'],
            'buyer_contract_info' => ['nullable', 'array'],
            'puc_quota_kg' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
