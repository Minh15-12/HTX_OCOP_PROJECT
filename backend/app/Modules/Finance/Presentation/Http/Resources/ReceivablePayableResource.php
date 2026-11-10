<?php

namespace Modules\Finance\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceivablePayableResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'debt_code' => $this->debt_code,
            'debt_type' => $this->debt_type,
            'counterparty_type' => $this->counterparty_type,
            'counterparty_id' => $this->counterparty_id,
            'counterparty_name' => $this->counterparty_name,
            'member_id' => $this->member_id,
            'source_transaction_id' => $this->source_transaction_id,
            'crop_season_id' => $this->crop_season_id,
            'crop_season_name' => $this->cropSeason?->name,
            'original_amount' => (float) $this->original_amount,
            'outstanding_amount' => (float) $this->outstanding_amount,
            'due_date' => $this->due_date?->format('Y-m-d'),
            'status' => $this->status,
            'description' => $this->description,
            'settlements_count' => $this->settlements ? $this->settlements->count() : 0,
            'settlements' => DebtSettlementResource::collection($this->whenLoaded('settlements')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
