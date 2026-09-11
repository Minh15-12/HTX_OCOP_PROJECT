<?php

namespace Modules\Finance\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReceivablePayableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'due_date' => ['sometimes', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
