<?php

namespace Modules\Agriculture\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFarmingLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'activity_type' => ['sometimes', 'string', 'in:SPRAYING,FERTILIZING,PLOWING,WEEDING,HARVESTING,IRRIGATION,PRUNING'],
            'activity_date' => ['sometimes', 'date'],
            'description' => ['nullable', 'string', 'max:2000'],
            'performed_by' => ['nullable', 'uuid', 'exists:users,id'],
            'attachment_reference' => ['nullable', 'array'],
        ];
    }
}
