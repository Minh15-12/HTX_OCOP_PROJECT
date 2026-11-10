<?php

namespace Modules\Inventory\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Finance\Infrastructure\Persistence\Models\ReceivablePayableModel;
use Modules\Inventory\Application\DTOs\CreateStockIssueDTO;
use Modules\Inventory\Domain\Entities\StockIssue;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialBatchModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MemberToolTrackingModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueLineModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueModel;

class StockIssueService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly MaterialService $materialService,
        private readonly AuditService $auditService
    ) {}

    public function listIssues(array $filters = [], int $perPage = 15, string $sort = '-issue_date'): LengthAwarePaginator
    {
        $query = StockIssueModel::with(['cooperative', 'member', 'creator', 'approver', 'lines.material']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%'.trim($filters['search']).'%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where('issue_number', $likeOp, $search);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['issue_date', 'created_at', 'issue_number', 'total_amount', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('issue_date', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getIssueById(string $id): StockIssueModel
    {
        $query = StockIssueModel::with(['cooperative', 'member', 'creator', 'approver', 'lines.material']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $issue = $query->where('id', $id)->first();

        if (!$issue) {
            throw new DomainException('Phiếu xuất kho không tồn tại trong hệ thống', 'STOCK_ISSUE_NOT_FOUND', null, 404);
        }

        return $issue;
    }

    public function createIssue(CreateStockIssueDTO $dto): StockIssueModel
    {
        $coopId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($coopId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi tạo phiếu xuất kho', 'TENANT_REQUIRED', null, 400);
        }

        if (empty($dto->lines)) {
            throw new DomainException('Phiếu xuất kho phải chứa ít nhất 1 dòng vật tư', 'EMPTY_ISSUE_LINES', null, 400);
        }

        $issueNumber = $dto->customIssueNumber ?: strtoupper('PXK-'.now()->format('Ymd').'-'.Str::random(4));

        $exists = StockIssueModel::where('issue_number', $issueNumber)->exists();
        if ($exists) {
            throw new DomainException("Mã phiếu xuất kho [{$issueNumber}] đã tồn tại", 'DUPLICATE_ISSUE_NUMBER', null, 409);
        }

        return DB::transaction(function () use ($dto, $coopId, $issueNumber) {
            $totalAmount = 0.0;
            $linesToInsert = [];

            foreach ($dto->lines as $lineDto) {
                if ($lineDto->quantity <= 0) {
                    throw new DomainException('Số lượng xuất phải lớn hơn 0', 'INVALID_LINE_QUANTITY', null, 400);
                }

                $material = MaterialModel::where('cooperative_id', $coopId)
                    ->where('id', $lineDto->materialId)
                    ->first();

                if (!$material) {
                    throw new DomainException("Vật tư [{$lineDto->materialId}] không tồn tại trong HTX", 'MATERIAL_NOT_FOUND', null, 404);
                }

                $lineAmount = $lineDto->quantity * $lineDto->unitPrice;
                $totalAmount += $lineAmount;

                $linesToInsert[] = [
                    'id' => (string) Str::uuid(),
                    'material_id' => $material->id,
                    'quantity' => $lineDto->quantity,
                    'unit_price' => $lineDto->unitPrice,
                    'batch_code' => $lineDto->batchCode,
                    'line_amount' => $lineAmount,
                ];
            }

            $issue = StockIssueModel::create([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'issue_number' => $issueNumber,
                'issue_date' => $dto->issueDate,
                'member_id' => $dto->memberId,
                'crop_season_id' => $dto->cropSeasonId,
                'is_credit' => $dto->isCredit,
                'purpose' => $dto->purpose,
                'status' => 'DRAFT',
                'total_amount' => $totalAmount,
                'created_by' => auth()->check() ? auth()->id() : null,
            ]);

            foreach ($linesToInsert as $line) {
                $line['stock_issue_id'] = $issue->id;
                StockIssueLineModel::create($line);
            }

            $this->auditService->log(
                action: 'STOCK_ISSUE_CREATED',
                entityType: 'StockIssue',
                entityId: $issue->id,
                after: $issue->toArray(),
                cooperativeId: $coopId
            );

            return $issue->load(['lines.material', 'creator', 'member']);
        });
    }

    public function submitIssue(string $id): StockIssueModel
    {
        $issue = $this->getIssueById($id);

        $domainEntity = new StockIssue(
            id: $issue->id,
            cooperativeId: $issue->cooperative_id,
            issueNumber: $issue->issue_number,
            issueDate: $issue->issue_date->format('Y-m-d'),
            status: $issue->status
        );

        $domainEntity->submit();
        $issue->update(['status' => $domainEntity->status]);

        $this->auditService->log(
            action: 'STOCK_ISSUE_SUBMITTED',
            entityType: 'StockIssue',
            entityId: $issue->id,
            after: $issue->toArray(),
            cooperativeId: $issue->cooperative_id
        );

        return $issue->fresh(['lines.material', 'creator', 'member']);
    }

    public function approveIssue(string $id): StockIssueModel
    {
        $issue = $this->getIssueById($id);

        if ($issue->status === 'APPROVED') {
            return $issue; // Idempotent approval
        }

        $domainEntity = new StockIssue(
            id: $issue->id,
            cooperativeId: $issue->cooperative_id,
            issueNumber: $issue->issue_number,
            issueDate: $issue->issue_date->format('Y-m-d'),
            status: $issue->status
        );

        $approverId = auth()->check() ? auth()->id() : null;
        $domainEntity->approve($approverId ?: 'SYSTEM');

        return DB::transaction(function () use ($issue, $domainEntity, $approverId) {
            // Check member credit limit if issued on credit
            if ($issue->is_credit && $issue->member_id) {
                $member = MemberModel::find($issue->member_id);
                if ($member) {
                    $existingCreditDebt = (float) StockIssueModel::where('member_id', $issue->member_id)
                        ->where('is_credit', true)
                        ->where('status', 'APPROVED')
                        ->where('id', '!=', $issue->id)
                        ->sum('total_amount');

                    $newTotal = $existingCreditDebt + (float) $issue->total_amount;
                    $creditLimit = (float) ($member->credit_limit ?? 0);
                    if ($creditLimit > 0 && $newTotal > $creditLimit) {
                        throw new DomainException(
                            "Giá trị xuất nợ [{$issue->total_amount}] làm tổng nợ [{$newTotal}] vượt quá trần tín dụng [{$creditLimit}] của xã viên",
                            'ERR_MEMBER_CREDIT_LIMIT_EXCEEDED',
                            null,
                            422
                        );
                    }
                }
            }

            // Lock materials for update to prevent concurrent stock depletion
            foreach ($issue->lines as $line) {
                $mat = MaterialModel::where('id', $line->material_id)->lockForUpdate()->first();

                $availableStock = $this->materialService->calculateAvailableStock($line->material_id);
                if ($availableStock < (float) $line->quantity) {
                    throw new DomainException(
                        "Tồn kho khả dụng của vật tư [{$mat->name} ({$mat->sku})] không đủ để xuất! Khả dụng: {$availableStock} {$mat->unit}, Yêu cầu xuất: {$line->quantity} {$mat->unit}",
                        'INSUFFICIENT_STOCK',
                        null,
                        400
                    );
                }

                // FEFO Batch stock deduction
                $needed = (float) $line->quantity;
                $batchQuery = MaterialBatchModel::where('material_id', $line->material_id)
                    ->where('cooperative_id', $issue->cooperative_id)
                    ->where('quantity', '>', 0);

                if (!empty($line->batch_code)) {
                    $batchQuery->where('batch_number', $line->batch_code);
                } else {
                    $batchQuery->orderByRaw('expired_at ASC NULLS LAST')
                        ->orderBy('created_at', 'asc');
                }

                $batches = $batchQuery->get();

                foreach ($batches as $batch) {
                    if ($needed <= 0) {
                        break;
                    }

                    if ($batch->expired_at && Carbon::parse($batch->expired_at)->isPast()) {
                        throw new DomainException(
                            "Lô vật tư [{$batch->batch_number}] của [{$mat->name}] đã hết hạn vào ngày ".Carbon::parse($batch->expired_at)->format('d/m/Y').', bị khóa xuất kho theo quy chuẩn an toàn VietGAP!',
                            'MATERIAL_BATCH_EXPIRED',
                            null,
                            400
                        );
                    }

                    $deduct = min((float) $batch->quantity, $needed);
                    $batch->decrement('quantity', $deduct);
                    $needed -= $deduct;
                }

                // Auto-create off-balance Account 005 record if issuing durable tools
                if ($mat->is_durable_tool && $issue->member_id) {
                    MemberToolTrackingModel::create([
                        'id' => (string) Str::uuid(),
                        'cooperative_id' => $issue->cooperative_id,
                        'member_id' => $issue->member_id,
                        'material_id' => $mat->id,
                        'serial_number' => $line->batch_code ?: ('TOOL-'.strtoupper(Str::random(6))),
                        'quantity' => (int) $line->quantity,
                        'status' => 'IN_USE',
                        'assigned_date' => $issue->issue_date,
                        'note' => "Cấp phát theo Phiếu xuất {$issue->issue_number}",
                        'created_by' => $approverId,
                    ]);
                }
            }

            // Check if issue contains pesticides to set up packaging return
            $expectedBottles = 0;
            foreach ($issue->lines as $line) {
                if ($line->material && $line->material->category === 'PESTICIDE') {
                    $expectedBottles += (int) ceil((float) $line->quantity);
                }
            }

            $updateData = [
                'status' => $domainEntity->status,
                'approved_by' => $approverId,
            ];

            if ($expectedBottles > 0) {
                $updateData['empty_bottles_expected'] = $expectedBottles;
                $updateData['packaging_returned_status'] = 'PENDING_RETURN';
            }

            $issue->update($updateData);

            // GAP-FIN-01 & BR-LOG-005: Auto-create Receivable Debt when issued on credit
            if ($issue->is_credit && $issue->member_id && (float) $issue->total_amount > 0) {
                $member = $issue->member;
                $memberName = $member?->identity_information['full_name'] ?? $member?->member_code ?? 'Xã viên HTX';
                $debtCode = strtoupper('CN-THU-'.now()->format('Ymd').'-'.Str::random(4));

                ReceivablePayableModel::create([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $issue->cooperative_id,
                    'debt_code' => $debtCode,
                    'debt_type' => 'RECEIVABLE',
                    'counterparty_type' => 'MEMBER',
                    'counterparty_id' => $issue->member_id,
                    'counterparty_name' => $memberName,
                    'member_id' => $issue->member_id,
                    'source_transaction_id' => $issue->id,
                    'crop_season_id' => $issue->crop_season_id,
                    'original_amount' => (float) $issue->total_amount,
                    'outstanding_amount' => (float) $issue->total_amount,
                    'due_date' => now()->addDays(90)->toDateString(),
                    'status' => 'OPEN',
                    'description' => "Nợ vật tư trả chậm theo Phiếu xuất [{$issue->issue_number}]".($issue->cropSeason ? " - Vụ: {$issue->cropSeason->name}" : ''),
                ]);
            } elseif (!$issue->is_credit && (float) $issue->total_amount > 0) {
                // GAP-FIN-02: Auto-record Cash Transaction (Income) when sold for immediate cash
                $voucherNumber = strtoupper('PT-XK-'.now()->format('Ymd').'-'.Str::random(4));
                CashTransactionModel::create([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $issue->cooperative_id,
                    'voucher_number' => $voucherNumber,
                    'transaction_type' => 'INCOME',
                    'amount' => (float) $issue->total_amount,
                    'transaction_date' => $issue->issue_date->format('Y-m-d'),
                    'category' => 'BAN_VAT_TU_NONG_NGHIEP',
                    'description' => "Thu tiền bán vật tư nông nghiệp theo Phiếu xuất kho [{$issue->issue_number}]",
                    'payer_payee' => $issue->member?->identity_information['full_name'] ?? $issue->member?->member_code ?? 'Xã viên/Khách hàng mua vật tư',
                    'member_id' => $issue->member_id,
                    'status' => 'POSTED',
                    'created_by' => $approverId,
                ]);
            }

            $this->auditService->log(
                action: 'STOCK_ISSUE_APPROVED',
                entityType: 'StockIssue',
                entityId: $issue->id,
                after: $issue->toArray(),
                cooperativeId: $issue->cooperative_id
            );

            return $issue->fresh(['lines.material', 'creator', 'approver', 'member', 'cropSeason']);
        });
    }

    public function recordPackagingReturn(string $id, int $returnedCount, ?string $proofPhotoUrl = null): StockIssueModel
    {
        $issue = $this->getIssueById($id);

        if ($returnedCount <= 0) {
            throw new DomainException('Số lượng vỏ bao bì thu hồi phải lớn hơn 0', 'INVALID_RETURN_QUANTITY', null, 400);
        }

        $newReturned = (int) $issue->empty_bottles_returned + $returnedCount;
        $expected = (int) $issue->empty_bottles_expected;

        $newStatus = ($newReturned >= $expected && $expected > 0)
            ? 'COMPLETED'
            : 'PARTIALLY_RETURNED';

        $issue->update([
            'empty_bottles_returned' => $newReturned,
            'packaging_returned_status' => $newStatus,
            'packaging_proof_url' => $proofPhotoUrl ?: $issue->packaging_proof_url,
            'packaging_returned_at' => now(),
            'packaging_returned_by' => auth()->check() ? auth()->id() : null,
        ]);

        $this->auditService->log(
            action: 'PACKAGING_RETURN_RECORDED',
            entityType: 'StockIssue',
            entityId: $issue->id,
            after: $issue->toArray(),
            cooperativeId: $issue->cooperative_id
        );

        return $issue->fresh(['lines.material', 'creator', 'approver', 'member']);
    }

    public function getVoucher02Data(string $id): array
    {
        $issue = $this->getIssueById($id);
        $coop = $issue->cooperative;
        $member = $issue->member;

        $lines = $issue->lines->map(function ($line, $index) {
            $mat = $line->material;

            return [
                'stt' => $index + 1,
                'name' => $mat?->name ?? 'Vật tư nông nghiệp',
                'sku' => $mat?->sku ?? 'N/A',
                'account_code' => $mat?->account_code ?: '1521',
                'batch_code' => $line->batch_code ?: 'LOT-DEFAULT',
                'unit' => $mat?->unit ?? 'đơn vị',
                'quantity_requested' => (float) $line->quantity,
                'quantity_issued' => (float) $line->quantity,
                'unit_price' => (float) $line->unit_price,
                'line_amount' => (float) $line->line_amount,
            ];
        });

        return [
            'voucher_title' => 'PHIẾU XUẤT KHO KIÊM SỔ CHIA VẬT TƯ TẬP TRUNG',
            'standard_code' => 'Mẫu số 02 - VT (Ban hành theo Thông tư số 71/2024/TT-BTC ngày 07/10/2024 của Bộ Tài chính)',
            'issue_number' => $issue->issue_number,
            'issue_date' => $issue->issue_date?->format('d/m/Y'),
            'cooperative' => [
                'legal_name' => $coop?->legal_name ?? 'HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN',
                'tax_code' => $coop?->tax_code ?? '5801234567',
                'address' => $coop?->address ?? 'Thành phố Đà Lạt, Tỉnh Lâm Đồng',
            ],
            'recipient' => [
                'full_name' => $member?->full_name ?? 'Hộ Xã viên Nguyễn Văn Nông',
                'member_code' => $member?->member_code ?? 'XV-001',
                'id_card_number' => $member?->id_card_number ?? '068075001234',
                'address' => $member?->address ?? 'Vùng trồng Chuyên canh Sweet Palermo',
            ],
            'purpose' => $issue->purpose ?: 'Cấp phát vật tư phục vụ chăm sóc vụ mùa VietGAP',
            'export_warehouse' => 'Kho Vật tư Trung tâm HTX (Hub Store)',
            'is_credit' => (bool) $issue->is_credit,
            'lines' => $lines,
            'total_amount' => (float) $issue->total_amount,
            'total_amount_in_words' => number_format((float) $issue->total_amount, 0, ',', '.').' đồng chẵn',
            'packaging_return' => [
                'status' => $issue->packaging_returned_status ?? 'NOT_REQUIRED',
                'expected' => (int) ($issue->empty_bottles_expected ?? 0),
                'returned' => (int) ($issue->empty_bottles_returned ?? 0),
                'proof_url' => $issue->packaging_proof_url,
            ],
            'signers' => [
                'creator' => $issue->creator?->full_name ?? 'Người Lập Phiếu',
                'recipient' => $member?->full_name ?? 'Hộ Xã Viên Nhận Hàng',
                'storekeeper' => 'Thủ Kho Trung Tâm',
                'accountant' => 'Kế Toán Trưởng',
                'director' => 'Giám Đốc Hợp Tác Xã',
            ],
        ];
    }
}
