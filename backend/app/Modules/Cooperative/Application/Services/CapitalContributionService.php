<?php

namespace Modules\Cooperative\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\DTOs\CreateCapitalContributionDTO;
use Modules\Cooperative\Domain\Entities\CapitalContribution;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\LandContributionModel;
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

        $paginator = CapitalContributionModel::with('landContribution')
            ->where('member_id', $member->id)
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
        $contribution = CapitalContributionModel::with(['member.cooperative', 'landContribution'])->find($id);

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

        // 1. Validate Law 2023 Rules: Personal 30% Limit (BR-COOP-004)
        $existingTotalCoopCapital = (float) CapitalContributionModel::whereHas('member', function ($q) use ($member) {
            $q->where('cooperative_id', $member->cooperative_id);
        })->where('status', 'PAID')->sum('amount');

        $newCoopTotalCapital = $existingTotalCoopCapital + $dto->amount;

        $existingMemberCapital = (float) CapitalContributionModel::where('member_id', $member->id)
            ->where('status', 'PAID')
            ->sum('amount');

        $newMemberCapital = $existingMemberCapital + $dto->amount;

        if ($newCoopTotalCapital > 0) {
            $newOwnershipRatio = ($newMemberCapital / $newCoopTotalCapital) * 100;
            if ($member->member_type === 'OFFICIAL' && $newOwnershipRatio > 30.0) {
                throw new DomainException(
                    "Giao dịch góp vốn làm tỷ lệ sở hữu của thành viên chính thức vượt trần 30% vốn điều lệ (dự kiến: " . round($newOwnershipRatio, 2) . "%). Vi phạm Điều 74 Luật HTX 2023.",
                    'ERR_CAPITAL_EXCEED_LIMIT',
                    null,
                    422
                );
            }
        }

        // 2. Validate Law 2023 Rules: Capital Associate Group 30% Limit (BR-COOP-005)
        if ($member->member_type === 'CAPITAL_ASSOCIATE' || $member->member_type === 'LIEN_KET_GOP_VON') {
            $existingAssociateCapital = (float) CapitalContributionModel::whereHas('member', function ($q) use ($member) {
                $q->where('cooperative_id', $member->cooperative_id)
                  ->whereIn('member_type', ['CAPITAL_ASSOCIATE', 'LIEN_KET_GOP_VON']);
            })->where('status', 'PAID')->sum('amount');

            $newAssociateTotal = $existingAssociateCapital + $dto->amount;
            if ($newCoopTotalCapital > 0 && ($newAssociateTotal / $newCoopTotalCapital) * 100 > 30.0) {
                throw new DomainException(
                    "Tổng vốn góp của nhóm Thành viên liên kết vượt trần 30% vốn điều lệ HTX. Vi phạm Luật HTX 2023.",
                    'ERR_ASSOCIATE_GROUP_CAPITAL_EXCEED_LIMIT',
                    null,
                    422
                );
            }
        }

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

        $certificateCode = 'GCN-' . date('Y') . '-' . strtoupper(Str::random(6));

        $contribution = CapitalContributionModel::create([
            'id' => $domainEntity->id,
            'member_id' => $domainEntity->memberId,
            'contribution_type' => $domainEntity->contributionType,
            'amount' => $domainEntity->amount,
            'actual_amount' => $domainEntity->amount,
            'committed_amount' => $member->committed_capital ?: $domainEntity->amount,
            'ownership_ratio' => $newCoopTotalCapital > 0 ? round(($newMemberCapital / $newCoopTotalCapital) * 100, 2) : 0,
            'transaction_date' => $domainEntity->transactionDate,
            'value_description' => $domainEntity->valueDescription,
            'evidence_reference' => $domainEntity->evidenceReference,
            'status' => $domainEntity->status,
            'certificate_code' => $certificateCode,
            'certificate_issue_date' => date('Y-m-d'),
            'issue_count' => 1,
            'qr_code_url' => 'https://htx.ocop.gov.vn/verify-certificate?code=' . $certificateCode,
        ]);

        // Save Land Contribution details if LAND type
        if (($dto->contributionType === 'LAND' || $dto->contributionType === 'QUYEN_SU_DUNG_DAT') && $dto->landCertificateNo) {
            LandContributionModel::create([
                'id' => (string) Str::uuid(),
                'contribution_id' => $contribution->id,
                'land_certificate_no' => $dto->landCertificateNo,
                'plot_number' => $dto->plotNumber ?: 'N/A',
                'map_sheet_number' => $dto->mapSheetNumber ?: 'N/A',
                'land_area_sqm' => $dto->landAreaSqm ?: 0,
                'land_use_type' => $dto->landUseType ?: 'Đất lúa',
                'appraised_unit_price' => $dto->appraisedUnitPrice ?: 0,
                'total_land_value' => $dto->amount,
                'cadastral_status' => 'REGISTERED_CHANGE',
            ]);
        }

        $this->auditService->log(
            action: 'CAPITAL_CONTRIBUTION_CREATED',
            entityType: 'CapitalContribution',
            entityId: $contribution->id,
            after: $contribution->toArray(),
            cooperativeId: $member->cooperative_id
        );

        return $contribution->load(['member', 'landContribution']);
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
