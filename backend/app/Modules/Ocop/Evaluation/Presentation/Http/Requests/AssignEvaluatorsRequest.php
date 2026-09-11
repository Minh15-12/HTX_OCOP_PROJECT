<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignEvaluatorsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'evaluators' => 'required|array|min:1',
            'evaluators.*.evaluator_id' => 'required|uuid',
            'evaluators.*.role' => 'nullable|string|in:CHAIRMAN,SECRETARY,MEMBER',
        ];
    }
}
