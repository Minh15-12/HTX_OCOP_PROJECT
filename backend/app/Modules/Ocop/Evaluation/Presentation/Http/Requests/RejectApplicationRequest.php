<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'decision_number' => 'required|string|max:100',
            'decision_date' => 'required|date',
            'reason' => 'required|string|max:2000',
            'authority_reference' => 'nullable|array',
        ];
    }
}
