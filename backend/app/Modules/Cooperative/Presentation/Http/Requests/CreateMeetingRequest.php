<?php

namespace Modules\Cooperative\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateMeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'meeting_type' => ['required', 'string', 'in:ANNUAL,EXTRAORDINARY,BOARD,DAI_HOI_THUONG_NIEN,DAI_HOI_BAT_THUONG'],
            'meeting_date' => ['required', 'date'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:PLANNED,IN_PROGRESS,COMPLETED,CANCELLED'],
        ];
    }

    public function messages(): array
    {
        return [
            'meeting_type.required' => 'Loại cuộc họp là bắt buộc',
            'meeting_date.required' => 'Ngày tổ chức đại hội/cuộc họp là bắt buộc',
            'title.required' => 'Tiêu đề cuộc họp là bắt buộc',
        ];
    }
}
