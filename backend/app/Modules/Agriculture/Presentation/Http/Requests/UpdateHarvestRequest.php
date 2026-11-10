<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHarvestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'harvest_date' => ['sometimes', 'date'],
            'quantity' => ['sometimes', 'numeric', 'gt:0'],
            'unit' => ['sometimes', 'string', 'max:30'],
            'quality_information' => ['nullable', 'array'],
            'kcs_status' => ['nullable', 'string', 'max:50'],
            'kcs_gate_check' => ['nullable', 'array'],
            'kcs_quick_lab' => ['nullable', 'array'],
            'grade' => ['nullable', 'string', 'in:GRADE_A,GRADE_B,REJECT'],
            'brix_level' => ['nullable', 'numeric', 'min:0'],
            'uniformity_rate' => ['nullable', 'numeric', 'between:0,100'],
            'grade_a_kg' => ['nullable', 'numeric', 'min:0'],
            'grade_b_kg' => ['nullable', 'numeric', 'min:0'],
            'reject_kg' => ['nullable', 'numeric', 'min:0'],
            'stage_number' => ['nullable', 'integer', 'min:1'],
            'weighing_slip_code' => ['nullable', 'string', 'max:100'],
            'rejection_weight_kg' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
