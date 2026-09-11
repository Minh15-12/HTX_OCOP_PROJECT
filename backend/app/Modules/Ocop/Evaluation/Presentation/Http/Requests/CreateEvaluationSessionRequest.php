<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateEvaluationSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'application_id' => 'required|uuid',
            'council_level_id' => 'required|uuid',
        ];
    }
}
