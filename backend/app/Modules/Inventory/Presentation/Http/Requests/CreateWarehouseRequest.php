<?php

namespace Modules\Inventory\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'warehouse_code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'manager_id' => ['nullable', 'uuid', 'exists:users,id'],
            'status' => ['nullable', 'string', 'in:ACTIVE,INACTIVE'],
        ];
    }

    public function messages(): array
    {
        return [
            'warehouse_code.required' => 'Mã kho không được để trống',
            'name.required' => 'Tên kho không được để trống',
            'manager_id.exists' => 'Thủ kho phụ trách không tồn tại',
        ];
    }
}
