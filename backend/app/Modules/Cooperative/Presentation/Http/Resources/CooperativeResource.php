<?php

namespace Modules\Cooperative\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CooperativeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_code' => $this->cooperative_code,
            'legal_name' => $this->legal_name,
            'tax_code' => $this->tax_code,
            'address' => $this->address,
            'phone_number' => $this->phone_number,
            'status' => $this->status,
        ];
    }
}
