<?php

namespace Modules\Finance\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'voucher_number' => $this->voucher_number,
            'transaction_type' => $this->transaction_type,
            'amount' => (float) $this->amount,
            'transaction_date' => $this->transaction_date?->format('Y-m-d'),
            'category' => $this->category,
            'description' => $this->description,
            'payer_payee' => $this->payer_payee,
            'member_id' => $this->member_id,
            'member_name' => $this->member?->identity_information['full_name'] ?? null,
            'status' => $this->status,
            'evidence_reference' => $this->evidence_reference,
            'created_by' => $this->created_by,
            'creator_name' => $this->creator?->full_name,
            'approved_by' => $this->approved_by,
            'approver_name' => $this->approver?->full_name,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
