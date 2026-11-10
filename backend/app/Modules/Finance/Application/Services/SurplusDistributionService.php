<?php

namespace Modules\Finance\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Finance\Application\DTOs\CreateSurplusDistributionPlanDTO;
use Modules\Finance\Domain\Entities\SurplusDistributionPlan;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Finance\Infrastructure\Persistence\Models\SurplusDistributionAllocationModel;
use Modules\Finance\Infrastructure\Persistence\Models\SurplusDistributionPlanModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueModel;

class SurplusDistributionService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listPlans(array $filters = [], int $perPage = 15, string $sort = '-financial_year'): LengthAwarePaginator
    {
        $query = SurplusDistributionPlanModel::with(['cooperative', 'creator', 'approver', 'allocations.member']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['financial_year'])) {
            $query->where('financial_year', (int) $filters['financial_year']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%'.trim($filters['search']).'%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where('plan_code', $likeOp, $search);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['financial_year', 'created_at', 'plan_code', 'total_surplus', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('financial_year', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getPlanById(string $id): SurplusDistributionPlanModel
    {
        $query = SurplusDistributionPlanModel::with(['cooperative', 'creator', 'approver', 'allocations.member']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $plan = $query->where('id', $id)->first();

        if (!$plan) {
            throw new DomainException('Phương án phân phối thặng dư không tồn tại', 'SURPLUS_PLAN_NOT_FOUND', null, 404);
        }

        return $plan;
    }

    public function createPlan(CreateSurplusDistributionPlanDTO $dto): SurplusDistributionPlanModel
    {
        $coopId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($coopId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi tạo phương án phân phối thặng dư', 'TENANT_REQUIRED', null, 400);
        }

        if ($dto->distributableSurplus > round($dto->totalSurplus * 0.95, 2)) {
            throw new DomainException(
                "Thặng dư phân phối [{$dto->distributableSurplus}] vượt quá 95% tổng thặng dư. Phải trích tối thiểu 5% vào quỹ không chia theo Luật HTX 2023",
                'ERR_FINANCE_INVALID_SURPLUS_PLAN',
                null,
                422
            );
        }

        if (round($dto->capitalWeight + $dto->serviceUsageWeight, 2) != 100.0) {
            throw new DomainException(
                'Tổng tỷ trọng phân phối theo vốn và dịch vụ phải bằng 100%',
                'ERR_FINANCE_INVALID_SURPLUS_PLAN',
                null,
                400
            );
        }

        if ($dto->serviceUsageWeight < 50.0) {
            throw new DomainException(
                "Tỷ trọng phân phối theo mức độ sử dụng dịch vụ [{$dto->serviceUsageWeight}%] không được thấp hơn 50% theo Luật Hợp tác xã 2023 Điều 85",
                'ERR_FINANCE_INVALID_SURPLUS_PLAN',
                null,
                422
            );
        }

        $planCode = $dto->customPlanCode ?: strtoupper("PADP-{$dto->financialYear}-".Str::random(4));

        $exists = SurplusDistributionPlanModel::where('cooperative_id', $coopId)
            ->where('financial_year', $dto->financialYear)
            ->exists();

        if ($exists) {
            throw new DomainException("Phương án phân phối thặng dư năm {$dto->financialYear} đã tồn tại cho Hợp tác xã", 'DUPLICATE_SURPLUS_PLAN', null, 409);
        }

        $domainEntity = new SurplusDistributionPlan(
            id: (string) Str::uuid(),
            cooperativeId: $coopId,
            planCode: $planCode,
            financialYear: $dto->financialYear,
            totalSurplus: $dto->totalSurplus,
            distributableSurplus: $dto->distributableSurplus,
            capitalWeight: $dto->capitalWeight,
            serviceUsageWeight: $dto->serviceUsageWeight,
            status: 'DRAFT',
            createdBy: auth()->check() ? auth()->id() : null
        );

        return DB::transaction(function () use ($domainEntity, $coopId) {
            $plan = SurplusDistributionPlanModel::create([
                'id' => $domainEntity->id,
                'cooperative_id' => $domainEntity->cooperativeId,
                'plan_code' => $domainEntity->planCode,
                'financial_year' => $domainEntity->financialYear,
                'total_surplus' => $domainEntity->totalSurplus,
                'distributable_surplus' => $domainEntity->distributableSurplus,
                'capital_weight' => $domainEntity->capitalWeight,
                'service_usage_weight' => $domainEntity->serviceUsageWeight,
                'status' => $domainEntity->status,
                'created_by' => $domainEntity->createdBy,
            ]);

            // Calculate member allocations
            $activeMembers = MemberModel::where('cooperative_id', $coopId)
                ->where('status', 'ACTIVE')
                ->get();

            if ($activeMembers->isEmpty()) {
                throw new DomainException('Hợp tác xã chưa có xã viên ACTIVE để phân phối thặng dư', 'NO_ACTIVE_MEMBERS', null, 400);
            }

            // Calculate total capital & total service usage across active members
            $memberCapitals = [];
            $memberServices = [];
            $totalCoopCapital = 0.0;
            $totalCoopService = 0.0;

            foreach ($activeMembers as $m) {
                $cap = (float) CapitalContributionModel::where('member_id', $m->id)->sum('amount');
                $svc = (float) StockIssueModel::where('cooperative_id', $coopId)
                    ->where('member_id', $m->id)
                    ->where('status', 'APPROVED')
                    ->sum('total_amount');

                $memberCapitals[$m->id] = $cap;
                $memberServices[$m->id] = $svc;

                $totalCoopCapital += $cap;
                $totalCoopService += $svc;
            }

            $capPool = $domainEntity->distributableSurplus * ($domainEntity->capitalWeight / 100.0);
            $svcPool = $domainEntity->distributableSurplus * ($domainEntity->serviceUsageWeight / 100.0);

            foreach ($activeMembers as $m) {
                $mCap = $memberCapitals[$m->id];
                $mSvc = $memberServices[$m->id];

                $capShare = $totalCoopCapital > 0
                    ? round($capPool * ($mCap / $totalCoopCapital), 2)
                    : round($capPool / max(1, $activeMembers->count()), 2);

                $svcShare = $totalCoopService > 0
                    ? round($svcPool * ($mSvc / $totalCoopService), 2)
                    : round($svcPool / max(1, $activeMembers->count()), 2);

                $totalAllocated = $capShare + $svcShare;

                SurplusDistributionAllocationModel::create([
                    'id' => (string) Str::uuid(),
                    'plan_id' => $plan->id,
                    'member_id' => $m->id,
                    'capital_contribution_snapshot' => $mCap,
                    'service_usage_snapshot' => $mSvc,
                    'capital_share_amount' => $capShare,
                    'service_share_amount' => $svcShare,
                    'total_allocated_amount' => $totalAllocated,
                    'debt_deduction' => 0.00,
                    'net_payout_amount' => $totalAllocated,
                    'reinvest_as_capital' => false,
                ]);
            }

            $this->auditService->log(
                action: 'SURPLUS_PLAN_CREATED',
                entityType: 'SurplusDistributionPlan',
                entityId: $plan->id,
                after: $plan->toArray(),
                cooperativeId: $coopId
            );

            return $plan->load(['allocations.member', 'creator']);
        });
    }

    public function submitPlan(string $id): SurplusDistributionPlanModel
    {
        $plan = $this->getPlanById($id);

        $domainEntity = new SurplusDistributionPlan(
            id: $plan->id,
            cooperativeId: $plan->cooperative_id,
            planCode: $plan->plan_code,
            financialYear: $plan->financial_year,
            totalSurplus: (float) $plan->total_surplus,
            distributableSurplus: (float) $plan->distributable_surplus,
            capitalWeight: (float) $plan->capital_weight,
            serviceUsageWeight: (float) $plan->service_usage_weight,
            status: $plan->status
        );

        $domainEntity->submit();
        $plan->update(['status' => $domainEntity->status]);

        $this->auditService->log(
            action: 'SURPLUS_PLAN_SUBMITTED',
            entityType: 'SurplusDistributionPlan',
            entityId: $plan->id,
            after: $plan->toArray(),
            cooperativeId: $plan->cooperative_id
        );

        return $plan->fresh(['allocations.member', 'creator']);
    }

    public function approvePlan(string $id): SurplusDistributionPlanModel
    {
        $plan = $this->getPlanById($id);

        if ($plan->status === 'APPROVED') {
            return $plan;
        }

        $domainEntity = new SurplusDistributionPlan(
            id: $plan->id,
            cooperativeId: $plan->cooperative_id,
            planCode: $plan->plan_code,
            financialYear: $plan->financial_year,
            totalSurplus: (float) $plan->total_surplus,
            distributableSurplus: (float) $plan->distributable_surplus,
            capitalWeight: (float) $plan->capital_weight,
            serviceUsageWeight: (float) $plan->service_usage_weight,
            status: $plan->status
        );

        $approverId = auth()->check() ? auth()->id() : null;
        $domainEntity->approve($approverId ?: 'SYSTEM');

        $plan->update([
            'status' => $domainEntity->status,
            'approved_by' => $approverId,
        ]);

        $this->auditService->log(
            action: 'SURPLUS_PLAN_APPROVED',
            entityType: 'SurplusDistributionPlan',
            entityId: $plan->id,
            after: $plan->toArray(),
            cooperativeId: $plan->cooperative_id
        );

        return $plan->fresh(['allocations.member', 'creator', 'approver']);
    }

    public function executePlan(string $id, array $options = []): SurplusDistributionPlanModel
    {
        $plan = $this->getPlanById($id);

        if ($plan->status === 'EXECUTED') {
            return $plan; // Idempotent
        }

        if ($plan->status !== 'APPROVED') {
            throw new DomainException('Chỉ có thể thực thi chi trả / tái đầu tư khi phương án đã được phê duyệt', 'INVALID_PLAN_STATUS', null, 400);
        }

        return DB::transaction(function () use ($plan, $options) {
            $allocations = $plan->allocations;

            foreach ($allocations as $alloc) {
                $member = $alloc->member;
                if (!$member) {
                    continue;
                }

                $payoutAmount = (float) $alloc->total_allocated_amount;
                if ($payoutAmount <= 0) {
                    continue;
                }

                $reinvest = false;
                if (isset($options['reinvest_member_ids']) && is_array($options['reinvest_member_ids'])) {
                    $reinvest = in_array($alloc->member_id, $options['reinvest_member_ids']);
                } elseif (isset($options['reinvest_as_capital'])) {
                    $reinvest = (bool) $options['reinvest_as_capital'];
                } else {
                    $reinvest = (bool) $alloc->reinvest_as_capital;
                }

                if ($reinvest) {
                    // Option A: REINVEST AS CAPITAL CONTRIBUTION -> Closes circle back to Stage 1!
                    $certCode = 'GCN-'.date('Y').'-'.strtoupper(Str::random(6));
                    CapitalContributionModel::create([
                        'id' => (string) Str::uuid(),
                        'member_id' => $member->id,
                        'contribution_type' => 'ADDITIONAL',
                        'amount' => $payoutAmount,
                        'actual_amount' => $payoutAmount,
                        'committed_amount' => $member->committed_capital ?: $payoutAmount,
                        'transaction_date' => now()->toDateString(),
                        'value_description' => "Tái đầu tư thặng dư năm {$plan->financial_year} vào vốn điều lệ HTX",
                        'status' => 'PAID',
                        'certificate_code' => $certCode,
                        'certificate_issue_date' => now()->toDateString(),
                        'issue_count' => 1,
                        'qr_code_url' => 'https://htx.ocop.gov.vn/verify-certificate?code='.$certCode,
                    ]);

                    // Increase member credit limit by 50% of reinvested capital
                    $newCreditLimit = (float) ($member->credit_limit ?? 0) + ($payoutAmount * 0.5);
                    $member->update(['credit_limit' => $newCreditLimit]);

                    $alloc->update([
                        'reinvest_as_capital' => true,
                        'net_payout_amount' => 0.00,
                    ]);
                } else {
                    // Option B: CASH PAYOUT -> Records Cash Expense in Cashbook
                    $voucherNo = strtoupper("PC-TD-{$plan->financial_year}-".Str::random(4));
                    CashTransactionModel::create([
                        'id' => (string) Str::uuid(),
                        'cooperative_id' => $plan->cooperative_id,
                        'voucher_number' => $voucherNo,
                        'transaction_type' => 'EXPENSE',
                        'amount' => $payoutAmount,
                        'transaction_date' => now()->toDateString(),
                        'category' => 'PROFIT_DISTRIBUTION',
                        'description' => "Chi trả thặng dư năm {$plan->financial_year} cho xã viên [{$member->member_code}]",
                        'payer_payee' => $member->identity_information['full_name'] ?? $member->member_code,
                        'member_id' => $member->id,
                        'status' => 'POSTED',
                        'created_by' => auth()->check() ? auth()->id() : null,
                    ]);

                    $alloc->update([
                        'reinvest_as_capital' => false,
                        'net_payout_amount' => $payoutAmount,
                    ]);
                }
            }

            $plan->update(['status' => 'EXECUTED']);

            $this->auditService->log(
                action: 'SURPLUS_PLAN_EXECUTED',
                entityType: 'SurplusDistributionPlan',
                entityId: $plan->id,
                after: $plan->toArray(),
                cooperativeId: $plan->cooperative_id
            );

            return $plan->fresh(['allocations.member', 'creator', 'approver']);
        });
    }
}
