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
        ];
    }
}
