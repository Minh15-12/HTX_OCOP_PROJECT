<?php

namespace Modules\Ocop\Dossier\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOcopApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'uuid'],
            'criteria_version_id' => ['required', 'uuid'],
            'application_type' => ['nullable', 'string', 'in:NEW,RE_EVALUATION,UPGRADE'],
            'application_number' => ['nullable', 'string', 'max:100'],
        ];
    }
}
