<?php

namespace Modules\Finance\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Finance\Application\DTOs\CreateCashTransactionDTO;
use Modules\Finance\Domain\Entities\CashTransaction;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;

class CashTransactionService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listTransactions(array $filters = [], int $perPage = 15, string $sort = '-transaction_date'): LengthAwarePaginator
    {
        $query = CashTransactionModel::with(['cooperative', 'member', 'creator', 'approver']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['transaction_type'])) {
            $query->where('transaction_type', $filters['transaction_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['search'])) {
            $search = '%'.trim($filters['search']).'%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where('voucher_number', $likeOp, $search);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['transaction_date', 'created_at', 'voucher_number', 'amount', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('transaction_date', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getTransactionById(string $id): CashTransactionModel
    {
        $query = CashTransactionModel::with(['cooperative', 'member', 'creator', 'approver']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $tx = $query->where('id', $id)->first();

        if (!$tx) {
            throw new DomainException('Giao dịch tiền mặt không tồn tại trong hệ thống', 'CASH_TRANSACTION_NOT_FOUND', null, 404);
        }

        return $tx;
    }

    public function calculateCashBalance(?string $coopId = null): float
    {
        $tenantCoopId = $this->tenantContext->getCooperativeId() ?: $coopId;

        $income = (float) CashTransactionModel::where('status', 'POSTED')
            ->when($tenantCoopId, fn ($q) => $q->where('cooperative_id', $tenantCoopId))
            ->where('transaction_type', 'INCOME')
            ->sum('amount');

        $expense = (float) CashTransactionModel::where('status', 'POSTED')
            ->when($tenantCoopId, fn ($q) => $q->where('cooperative_id', $tenantCoopId))
            ->where('transaction_type', 'EXPENSE')
            ->sum('amount');

        return $income - $expense;
    }

    public function createTransaction(CreateCashTransactionDTO $dto): CashTransactionModel
    {
        $coopId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($coopId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi tạo phiếu thu/chi', 'TENANT_REQUIRED', null, 400);
        }

        $prefix = $dto->transactionType === 'INCOME' ? 'PT' : 'PC';
        $voucherNumber = $dto->customVoucherNumber ?: strtoupper("{$prefix}-".now()->format('Ymd').'-'.Str::random(4));

        $exists = CashTransactionModel::where('voucher_number', $voucherNumber)->exists();
        if ($exists) {
            throw new DomainException("Số chứng từ [{$voucherNumber}] đã tồn tại trong hệ thống", 'DUPLICATE_VOUCHER_NUMBER', null, 409);
        }

        $domainEntity = new CashTransaction(
            id: (string) Str::uuid(),
            cooperativeId: $coopId,
            voucherNumber: $voucherNumber,
            transactionType: $dto->transactionType,
            amount: $dto->amount,
            transactionDate: $dto->transactionDate,
            category: $dto->category,
            status: 'DRAFT',
            description: $dto->description,
            payerPayee: $dto->payerPayee,
            memberId: $dto->memberId,
            evidenceReference: $dto->evidenceReference,
            createdBy: auth()->check() ? auth()->id() : null
        );

        $tx = CashTransactionModel::create([
            'id' => $domainEntity->id,
            'cooperative_id' => $domainEntity->cooperativeId,
            'voucher_number' => $domainEntity->voucherNumber,
            'transaction_type' => $domainEntity->transactionType,
            'amount' => $domainEntity->amount,
            'transaction_date' => $domainEntity->transactionDate,
            'category' => $domainEntity->category,
            'description' => $domainEntity->description,
            'payer_payee' => $domainEntity->payerPayee,
            'member_id' => $domainEntity->memberId,
            'status' => $domainEntity->status,
            'evidence_reference' => $domainEntity->evidenceReference,
            'created_by' => $domainEntity->createdBy,
        ]);

        $this->auditService->log(
            action: 'CASH_TRANSACTION_CREATED',
            entityType: 'CashTransaction',
            entityId: $tx->id,
            after: $tx->toArray(),
            cooperativeId: $coopId
        );

        return $tx->load(['member', 'creator']);
    }

    public function approveTransaction(string $id): CashTransactionModel
    {
        $tx = $this->getTransactionById($id);

        if ($tx->status === 'APPROVED' || $tx->status === 'POSTED') {
            return $tx;
        }

        $domainEntity = new CashTransaction(
            id: $tx->id,
            cooperativeId: $tx->cooperative_id,
            voucherNumber: $tx->voucher_number,
            transactionType: $tx->transaction_type,
            amount: (float) $tx->amount,
            transactionDate: $tx->transaction_date->format('Y-m-d'),
            category: $tx->category,
            status: $tx->status
        );

        $approverId = auth()->check() ? auth()->id() : null;
        $domainEntity->approve($approverId ?: 'SYSTEM');

        $tx->update([
            'status' => $domainEntity->status,
            'approved_by' => $approverId,
        ]);

        $this->auditService->log(
            action: 'CASH_TRANSACTION_APPROVED',
            entityType: 'CashTransaction',
            entityId: $tx->id,
            after: $tx->toArray(),
            cooperativeId: $tx->cooperative_id
        );

        return $tx->fresh(['member', 'creator', 'approver']);
    }

    public function postTransaction(string $id): CashTransactionModel
    {
        $tx = $this->getTransactionById($id);

        if ($tx->status === 'POSTED') {
            return $tx; // Idempotent
        }

        $domainEntity = new CashTransaction(
            id: $tx->id,
            cooperativeId: $tx->cooperative_id,
            voucherNumber: $tx->voucher_number,
            transactionType: $tx->transaction_type,
            amount: (float) $tx->amount,
            transactionDate: $tx->transaction_date->format('Y-m-d'),
            category: $tx->category,
            status: $tx->status
        );

        $domainEntity->post();

        return DB::transaction(function () use ($tx, $domainEntity) {
            $tx->update(['status' => $domainEntity->status]);

            $this->auditService->log(
                action: 'CASH_TRANSACTION_POSTED',
                entityType: 'CashTransaction',
                entityId: $tx->id,
                after: $tx->toArray(),
                cooperativeId: $tx->cooperative_id
            );

            return $tx->fresh(['member', 'creator', 'approver']);
        });
    }
}
