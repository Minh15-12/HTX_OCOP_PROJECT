<?php

namespace Modules\Product\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Agriculture\Presentation\Http\Resources\LotResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'product_code' => $this->product_code,
            'product_name' => $this->product_name,
            'category' => $this->category,
            'specification' => $this->specification,
            'brand' => $this->brand,
            'quality_information' => $this->quality_information,
            'status' => $this->status,
            'lots_count' => $this->lots ? $this->lots->count() : 0,
            'lots' => LotResource::collection($this->whenLoaded('lots')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
