<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveFinalDecisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return \Illuminate\Support\Facades\Gate::allows('OCOP_DECISION.APPROVE');
    }

    public function rules(): array
    {
        return [
            'decision_number' => 'required|string|max:100',
            'decision_date' => 'required|date',
            'final_classification' => 'required|string|in:3_STAR,4_STAR,5_STAR,REJECTED',
            'authority_reference' => 'nullable|array',
            'effective_date' => 'nullable|date',
            'document_reference' => 'nullable|array',
        ];
    }
}
