<?php

namespace Modules\Cooperative\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\DTOs\CreateCapitalContributionDTO;
use Modules\Cooperative\Domain\Entities\CapitalContribution;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;

class CapitalContributionService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listMemberContributions(string $memberId, int $perPage = 15): array
    {
        $member = $this->getVerifiedMember($memberId);

        $paginator = CapitalContributionModel::where('member_id', $member->id)
            ->orderBy('transaction_date', 'desc')
            ->paginate(min(max($perPage, 1), 100));

        $totalContribution = (float) CapitalContributionModel::where('member_id', $member->id)
            ->where('status', 'PAID')
            ->sum('amount');

        return [
            'paginator' => $paginator,
            'total_contribution' => $totalContribution,
            'member' => $member,
        ];
    }

    public function getContributionById(string $id): CapitalContributionModel
    {
        $contribution = CapitalContributionModel::with('member.cooperative')->find($id);

        if (!$contribution) {
            throw new DomainException('Lịch sử góp vốn không tồn tại trong hệ thống', 'CONTRIBUTION_NOT_FOUND', null, 404);
        }

        // Verify Tenant Scope
        if ($this->tenantContext->hasTenant() && $contribution->member->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập dữ liệu góp vốn của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $contribution;
    }

    public function createContribution(CreateCapitalContributionDTO $dto): CapitalContributionModel
    {
        $member = $this->getVerifiedMember($dto->memberId);

        $domainEntity = new CapitalContribution(
            id: (string) Str::uuid(),
            memberId: $member->id,
            contributionType: $dto->contributionType,
            amount: $dto->amount,
            transactionDate: $dto->transactionDate,
            valueDescription: $dto->valueDescription,
            evidenceReference: $dto->evidenceReference,
            status: 'PAID'
        );

        $contribution = CapitalContributionModel::create([
            'id' => $domainEntity->id,
            'member_id' => $domainEntity->memberId,
            'contribution_type' => $domainEntity->contributionType,
            'amount' => $domainEntity->amount,
            'transaction_date' => $domainEntity->transactionDate,
            'value_description' => $domainEntity->valueDescription,
            'evidence_reference' => $domainEntity->evidenceReference,
            'status' => $domainEntity->status,
        ]);

        $this->auditService->log(
            action: 'CAPITAL_CONTRIBUTION_CREATED',
            entityType: 'CapitalContribution',
            entityId: $contribution->id,
            after: $contribution->toArray(),
            cooperativeId: $member->cooperative_id
        );

        return $contribution->load('member');
    }

    private function getVerifiedMember(string $memberId): MemberModel
    {
        $query = MemberModel::query();
        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $member = $query->where('id', $memberId)->first();
        if (!$member) {
            throw new DomainException('Xã viên không tồn tại hoặc thuộc Hợp tác xã khác', 'MEMBER_NOT_FOUND', null, 404);
        }

        return $member;
    }
}
