<?php

namespace Modules\Finance\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
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
        $query = ReceivablePayableModel::with(['cooperative', 'settlements']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['debt_type'])) {
            $query->where('debt_type', $filters['debt_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
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
        $debtCode = $dto->customDebtCode ?: strtoupper("{$prefix}-" . now()->format('Ymd') . '-' . Str::random(4));

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
        if ($dto->dueDate !== null) $updates['due_date'] = $dto->dueDate;
        if ($dto->description !== null) $updates['description'] = $dto->description;

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
                $voucherNumber = strtoupper("{$prefix}-" . now()->format('Ymd') . '-' . Str::random(4));

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
}
