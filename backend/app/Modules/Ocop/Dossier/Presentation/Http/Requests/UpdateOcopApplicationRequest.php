<?php

namespace Modules\Ocop\Dossier\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOcopApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'application_type' => ['nullable', 'string', 'in:NEW,RE_EVALUATION,UPGRADE'],
        ];
    }
}
