<?php

namespace Modules\Finance\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Finance\Application\DTOs\CreateDebtSettlementDTO;
use Modules\Finance\Application\DTOs\CreateReceivablePayableDTO;
use Modules\Finance\Application\DTOs\UpdateReceivablePayableDTO;
use Modules\Finance\Domain\Entities\ReceivablePayable;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Finance\Infrastructure\Persistence\Models\DebtSettlementModel;
use Modules\Finance\Infrastructure\Persistence\Models\ReceivablePayableModel;

class ReceivablePayableService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listDebts(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = ReceivablePayableModel::with(['cooperative', 'settlements', 'cropSeason']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['debt_type'])) {
            $query->where('debt_type', $filters['debt_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['crop_season_id'])) {
            $query->where('crop_season_id', $filters['crop_season_id']);
        }

        if (!empty($filters['member_id'])) {
            $query->where('member_id', $filters['member_id']);
        }

        if (!empty($filters['search'])) {
            $search = '%'.trim($filters['search']).'%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('debt_code', $likeOp, $search)
                    ->orWhere('counterparty_name', $likeOp, $search);
            });
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['created_at', 'due_date', 'original_amount', 'outstanding_amount', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getDebtById(string $id): ReceivablePayableModel
    {
        $query = ReceivablePayableModel::with(['cooperative', 'settlements.creator']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $debt = $query->where('id', $id)->first();

        if (!$debt) {
            throw new DomainException('Bản ghi công nợ không tồn tại trong hệ thống', 'DEBT_NOT_FOUND', null, 404);
        }

        return $debt;
    }

    public function createDebt(CreateReceivablePayableDTO $dto): ReceivablePayableModel
    {
        $coopId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($coopId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi tạo công nợ', 'TENANT_REQUIRED', null, 400);
        }

        $prefix = $dto->debtType === 'RECEIVABLE' ? 'CN-THU' : 'CN-TRA';
        $debtCode = $dto->customDebtCode ?: strtoupper("{$prefix}-".now()->format('Ymd').'-'.Str::random(4));

        $exists = ReceivablePayableModel::where('debt_code', $debtCode)->exists();
        if ($exists) {
            throw new DomainException("Mã công nợ [{$debtCode}] đã tồn tại trong hệ thống", 'DUPLICATE_DEBT_CODE', null, 409);
        }

        $domainEntity = new ReceivablePayable(
            id: (string) Str::uuid(),
            cooperativeId: $coopId,
            debtCode: $debtCode,
            debtType: $dto->debtType,
            counterpartyType: $dto->counterpartyType,
            counterpartyName: $dto->counterpartyName,
            originalAmount: $dto->originalAmount,
            outstandingAmount: $dto->originalAmount,
            dueDate: $dto->dueDate,
            status: 'OPEN',
            counterpartyId: $dto->counterpartyId,
            description: $dto->description
        );

        $debt = ReceivablePayableModel::create([
            'id' => $domainEntity->id,
            'cooperative_id' => $domainEntity->cooperativeId,
            'debt_code' => $domainEntity->debtCode,
            'debt_type' => $domainEntity->debtType,
            'counterparty_type' => $domainEntity->counterpartyType,
            'counterparty_id' => $domainEntity->counterpartyId,
            'counterparty_name' => $domainEntity->counterpartyName,
            'original_amount' => $domainEntity->originalAmount,
            'outstanding_amount' => $domainEntity->outstandingAmount,
            'due_date' => $domainEntity->dueDate,
            'status' => $domainEntity->status,
            'description' => $domainEntity->description,
        ]);

        $this->auditService->log(
            action: 'RECEIVABLE_PAYABLE_CREATED',
            entityType: 'ReceivablePayable',
            entityId: $debt->id,
            after: $debt->toArray(),
            cooperativeId: $coopId
        );

        return $debt->load('cooperative');
    }

    public function updateDebt(string $id, UpdateReceivablePayableDTO $dto): ReceivablePayableModel
    {
        $debt = $this->getDebtById($id);
        $before = $debt->toArray();

        $updates = [];
        if ($dto->dueDate !== null) {
            $updates['due_date'] = $dto->dueDate;
        }
        if ($dto->description !== null) {
            $updates['description'] = $dto->description;
        }

        if (!empty($updates)) {
            $debt->update($updates);

            $this->auditService->log(
                action: 'RECEIVABLE_PAYABLE_UPDATED',
                entityType: 'ReceivablePayable',
                entityId: $debt->id,
                before: $before,
                after: $debt->toArray(),
                cooperativeId: $debt->cooperative_id
            );
        }

        return $debt->fresh('cooperative');
    }

    public function createSettlement(CreateDebtSettlementDTO $dto): DebtSettlementModel
    {
        return DB::transaction(function () use ($dto) {
            // Lock debt record for update to prevent concurrent over-settlement
            $debtModel = ReceivablePayableModel::where('id', $dto->debtId)->lockForUpdate()->first();

            if (!$debtModel) {
                throw new DomainException('Bản ghi công nợ không tồn tại', 'DEBT_NOT_FOUND', null, 404);
            }

            if ($this->tenantContext->hasTenant() && $debtModel->cooperative_id !== $this->tenantContext->getCooperativeId()) {
                throw new DomainException('Không có quyền truy cập công nợ này', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
            }

            $domainDebt = new ReceivablePayable(
                id: $debtModel->id,
                cooperativeId: $debtModel->cooperative_id,
                debtCode: $debtModel->debt_code,
                debtType: $debtModel->debt_type,
                counterpartyType: $debtModel->counterparty_type,
                counterpartyName: $debtModel->counterparty_name,
                originalAmount: (float) $debtModel->original_amount,
                outstandingAmount: (float) $debtModel->outstanding_amount,
                dueDate: $debtModel->due_date->format('Y-m-d'),
                status: $debtModel->status,
                counterpartyId: $debtModel->counterparty_id,
                description: $debtModel->description
            );

            // Apply settlement domain logic (validates amount <= outstandingAmount)
            $domainDebt->applySettlement($dto->amount);

            $cashTxId = null;

            // Automatically create & post Cash Transaction if CASH method used
            if (strtoupper($dto->paymentMethod) === 'CASH') {
                $txType = $debtModel->debt_type === 'RECEIVABLE' ? 'INCOME' : 'EXPENSE';
                $prefix = $txType === 'INCOME' ? 'PT-CT' : 'PC-CT';
                $voucherNumber = strtoupper("{$prefix}-".now()->format('Ymd').'-'.Str::random(4));

                $cashTx = CashTransactionModel::create([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $debtModel->cooperative_id,
                    'voucher_number' => $voucherNumber,
                    'transaction_type' => $txType,
                    'amount' => $dto->amount,
                    'transaction_date' => $dto->settlementDate,
                    'category' => 'THANH_TOAN_CONG_NO',
                    'description' => "Thanh toán cho công nợ [{$debtModel->debt_code}] - Đối tác: {$debtModel->counterparty_name}",
                    'payer_payee' => $debtModel->counterparty_name,
                    'member_id' => $debtModel->counterparty_type === 'MEMBER' ? $debtModel->counterparty_id : null,
                    'status' => 'POSTED', // Instantly posted for immediate cash balance update
                    'created_by' => auth()->check() ? auth()->id() : null,
                ]);

                $cashTxId = $cashTx->id;
            }

            $debtModel->update([
                'outstanding_amount' => $domainDebt->outstandingAmount,
                'status' => $domainDebt->status,
            ]);

            $settlement = DebtSettlementModel::create([
                'id' => (string) Str::uuid(),
                'debt_id' => $debtModel->id,
                'settlement_date' => $dto->settlementDate,
                'amount' => $dto->amount,
                'payment_method' => strtoupper($dto->paymentMethod),
                'cash_transaction_id' => $cashTxId,
                'reference_number' => $dto->referenceNumber,
                'note' => $dto->note,
                'created_by' => auth()->check() ? auth()->id() : null,
                'created_at' => now(),
            ]);

            $this->auditService->log(
                action: 'DEBT_SETTLEMENT_CREATED',
                entityType: 'DebtSettlement',
                entityId: $settlement->id,
                after: $settlement->toArray(),
                cooperativeId: $debtModel->cooperative_id
            );

            return $settlement->load(['debt', 'cashTransaction', 'creator']);
        });
    }

    public function listSettlements(string $debtId): Collection
    {
        $debt = $this->getDebtById($debtId);

        return $debt->settlements;
    }

    public function offsetHarvestDebt(string $memberId, float $harvestProduceValue, float $serviceFeeRate = 0.025): array
    {
        if ($harvestProduceValue <= 0) {
            throw new DomainException('Giá trị nông sản thu mua phải lớn hơn 0', 'ERR_FINANCE_INVALID_SETTLEMENT', null, 400);
        }

        $serviceFee = round($harvestProduceValue * $serviceFeeRate, 2);
        $remainingAfterFee = max(0.0, $harvestProduceValue - $serviceFee);

        $coopId = $this->tenantContext->getCooperativeId();

        // Fetch open RECEIVABLE debts for this member
        $openDebts = ReceivablePayableModel::where('counterparty_id', $memberId)
            ->where('debt_type', 'RECEIVABLE')
            ->whereIn('status', ['OPEN', 'PARTIALLY_SETTLED'])
            ->orderBy('due_date', 'asc')
            ->get();

        $totalMemberDebt = (float) $openDebts->sum('outstanding_amount');
        $debtOffset = min($totalMemberDebt, $remainingAfterFee);
        $netPayout = round($remainingAfterFee - $debtOffset, 2);

        return DB::transaction(function () use ($memberId, $openDebts, $debtOffset, $serviceFee, $netPayout, $harvestProduceValue, $totalMemberDebt, $coopId) {
            $remainingOffsetToApply = $debtOffset;

            foreach ($openDebts as $debtModel) {
                if ($remainingOffsetToApply <= 0) {
                    break;
                }

                $offsetAmount = min((float) $debtModel->outstanding_amount, $remainingOffsetToApply);
                $newOutstanding = (float) $debtModel->outstanding_amount - $offsetAmount;
                $newStatus = $newOutstanding == 0 ? 'SETTLED' : 'PARTIALLY_SETTLED';

                $debtModel->update([
                    'outstanding_amount' => $newOutstanding,
                    'status' => $newStatus,
                ]);

                DebtSettlementModel::create([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $coopId,
                    'debt_id' => $debtModel->id,
                    'settlement_type' => 'HARVEST_OFFSET',
                    'payment_method' => 'HARVEST_OFFSET',
                    'amount' => $offsetAmount,
                    'settlement_date' => now()->toDateString(),
                    'note' => "Cấn trừ nợ tự động khi quyết toán nông sản ({$harvestProduceValue} VNĐ)",
                    'status' => 'POSTED',
                    'created_by' => auth()->check() ? auth()->id() : null,
                ]);

                $remainingOffsetToApply -= $offsetAmount;
            }

            // If netPayout > 0, record Cash Expense transaction to pay member
            if ($netPayout > 0 && $coopId) {
                CashTransactionModel::create([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $coopId,
                    'voucher_number' => strtoupper('PC-QT-'.now()->format('Ymd').'-'.Str::random(4)),
                    'transaction_type' => 'EXPENSE',
                    'amount' => $netPayout,
                    'transaction_date' => now()->toDateString(),
                    'category' => 'QUYET_TOAN_MUA_VU',
                    'description' => 'Thực chi thanh toán quyết toán nông sản sau cấn trừ nợ',
                    'member_id' => $memberId,
                    'status' => 'POSTED',
                    'created_by' => auth()->check() ? auth()->id() : null,
                ]);
            }

            // Record HTX service fee as income in cashbook
            if ($serviceFee > 0 && $coopId) {
                CashTransactionModel::create([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $coopId,
                    'voucher_number' => strtoupper('PT-DV-'.now()->format('Ymd').'-'.Str::random(4)),
                    'transaction_type' => 'INCOME',
                    'amount' => $serviceFee,
                    'transaction_date' => now()->toDateString(),
                    'category' => 'FEE_SERVICE',
                    'description' => 'Thu phí dịch vụ hỗ trợ thu mua nông sản',
                    'member_id' => $memberId,
                    'status' => 'POSTED',
                    'created_by' => auth()->check() ? auth()->id() : null,
                ]);
            }

            $this->auditService->log(
                action: 'HARVEST_SETTLEMENT_PROCESSED',
                entityType: 'Member',
                entityId: $memberId,
                after: [
                    'produce_value' => $harvestProduceValue,
                    'service_fee' => $serviceFee,
                    'debt_offset' => $debtOffset,
                    'net_payout' => $netPayout,
                ],
                cooperativeId: $coopId
            );

            return [
                'gross_produce_value' => $harvestProduceValue,
                'service_fee' => $serviceFee,
                'total_debt_offset' => $debtOffset,
                'net_payout' => $netPayout,
                'remaining_member_debt' => max(0.0, $totalMemberDebt - $debtOffset),
            ];
        });
    }

    public function getDebtSummary(array $filters = []): array
    {
        $query = ReceivablePayableModel::query();

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $allDebts = $query->where('status', '!=', 'PAID')->get();

        $today = now()->startOfDay();

        $totalReceivable = 0.0;
        $overdueReceivable = 0.0;
        $totalPayable = 0.0;
        $overduePayable = 0.0;

        $aging = [
            'current' => 0.0,       // not overdue
            'overdue_1_30' => 0.0,  // 1-30 days overdue
            'overdue_31_60' => 0.0, // 31-60 days overdue
            'overdue_61_90' => 0.0, // 61-90 days overdue
            'overdue_90_plus' => 0.0, // > 90 days overdue
        ];

        foreach ($allDebts as $debt) {
            $amount = (float) $debt->outstanding_amount;
            $dueDate = $debt->due_date ? Carbon::parse($debt->due_date)->startOfDay() : null;
            $isOverdue = $dueDate && $dueDate->lt($today);

            if ($debt->debt_type === 'RECEIVABLE') {
                $totalReceivable += $amount;
                if ($isOverdue) {
                    $overdueReceivable += $amount;
                }
            } else {
                $totalPayable += $amount;
                if ($isOverdue) {
                    $overduePayable += $amount;
                }
            }

            if (!$dueDate || $dueDate->gte($today)) {
                $aging['current'] += $amount;
            } else {
                $daysOverdue = abs((int) $today->diffInDays($dueDate));
                if ($daysOverdue <= 30) {
                    $aging['overdue_1_30'] += $amount;
                } elseif ($daysOverdue <= 60) {
                    $aging['overdue_31_60'] += $amount;
                } elseif ($daysOverdue <= 90) {
                    $aging['overdue_61_90'] += $amount;
                } else {
                    $aging['overdue_90_plus'] += $amount;
                }
            }
        }

        return [
            'total_receivable' => round($totalReceivable, 2),
            'overdue_receivable' => round($overdueReceivable, 2),
            'total_payable' => round($totalPayable, 2),
            'overdue_payable' => round($overduePayable, 2),
            'net_debt_position' => round($totalReceivable - $totalPayable, 2),
            'total_open_debts_count' => $allDebts->count(),
            'aging_breakdown' => [
                'current' => round($aging['current'], 2),
                'overdue_1_30' => round($aging['overdue_1_30'], 2),
                'overdue_31_60' => round($aging['overdue_31_60'], 2),
                'overdue_61_90' => round($aging['overdue_61_90'], 2),
                'overdue_90_plus' => round($aging['overdue_90_plus'], 2),
            ],
        ];
    }
}
