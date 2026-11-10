<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class SaveEvaluatorScoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('OCOP_EVALUATION.SCORE');
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
