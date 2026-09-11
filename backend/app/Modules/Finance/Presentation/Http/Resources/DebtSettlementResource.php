<?php

namespace Modules\Finance\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DebtSettlementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'debt_id' => $this->debt_id,
            'settlement_date' => $this->settlement_date?->format('Y-m-d'),
            'amount' => (float) $this->amount,
            'payment_method' => $this->payment_method,
            'cash_transaction_id' => $this->cash_transaction_id,
            'cash_voucher_number' => $this->cashTransaction?->voucher_number,
            'reference_number' => $this->reference_number,
            'note' => $this->note,
            'created_by' => $this->created_by,
            'creator_name' => $this->creator?->full_name,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
