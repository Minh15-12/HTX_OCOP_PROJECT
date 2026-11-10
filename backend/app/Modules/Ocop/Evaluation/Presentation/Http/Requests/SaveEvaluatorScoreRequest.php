<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveEvaluatorScoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return \Illuminate\Support\Facades\Gate::allows('OCOP_EVALUATION.SCORE');
    }

    public function rules(): array
    {
        return [
            'scores' => 'required|array|min:1',
            'scores.*.indicator_id' => 'required|uuid',
            'scores.*.score' => 'required|numeric|min:0',
            'scores.*.comment' => 'nullable|string|max:1000',
        ];
    }
}
