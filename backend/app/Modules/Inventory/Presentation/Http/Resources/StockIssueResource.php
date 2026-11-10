<?php

namespace Modules\Inventory\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockIssueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->cooperative?->legal_name,
            'issue_number' => $this->issue_number,
            'issue_date' => $this->issue_date?->format('Y-m-d'),
            'member_id' => $this->member_id,
            'member_name' => $this->member?->identity_information['full_name'] ?? null,
            'crop_season_id' => $this->crop_season_id,
            'crop_season_name' => $this->cropSeason?->name,
            'is_credit' => (bool) $this->is_credit,
            'purpose' => $this->purpose,
            'status' => $this->status,
            'packaging_returned_status' => $this->packaging_returned_status ?? 'NOT_REQUIRED',
            'empty_bottles_expected' => (int) ($this->empty_bottles_expected ?? 0),
            'empty_bottles_returned' => (int) ($this->empty_bottles_returned ?? 0),
            'packaging_proof_url' => $this->packaging_proof_url,
            'packaging_returned_at' => $this->packaging_returned_at?->toIso8601String(),
            'total_amount' => (float) $this->total_amount,
            'created_by' => $this->created_by,
            'creator_name' => $this->creator?->full_name,
            'approved_by' => $this->approved_by,
            'approver_name' => $this->approver?->full_name,
            'lines' => StockIssueLineResource::collection($this->whenLoaded('lines')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
