<?php

namespace Modules\Inventory\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'manager_id' => ['nullable', 'uuid', 'exists:users,id'],
            'status' => ['sometimes', 'string', 'in:ACTIVE,INACTIVE'],
        ];
    }
}
