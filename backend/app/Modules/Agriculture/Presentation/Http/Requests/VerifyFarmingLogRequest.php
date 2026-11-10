<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyFarmingLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
