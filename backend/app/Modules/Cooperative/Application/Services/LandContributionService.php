<?php

namespace Modules\Cooperative\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\LandContributionModel;

class LandContributionService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly MemberService $memberService,
        private readonly AuditService $auditService
    ) {}

    public function listAllLandContributions(): Collection
    {
        $query = LandContributionModel::with('contribution.member');

        if ($this->tenantContext->hasTenant()) {
            $coopId = $this->tenantContext->getCooperativeId();
            $query->whereHas('contribution.member', function ($q) use ($coopId) {
                $q->where('cooperative_id', $coopId);
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function listLandContributionsByMember(string $memberId): Collection
    {
        $member = $this->memberService->getMemberById($memberId);

        return LandContributionModel::with('contribution.member')
            ->whereHas('contribution', function ($q) use ($member) {
                $q->where('member_id', $member->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getLandContributionById(string $id): LandContributionModel
    {
        $land = LandContributionModel::with('contribution.member')->find($id);

        if (!$land) {
            throw new DomainException('Bản ghi góp vốn quyền sử dụng đất không tồn tại', 'LAND_CONTRIBUTION_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant()) {
            $memberCoopId = $land->contribution?->member?->cooperative_id;
            if ($memberCoopId && $memberCoopId !== $this->tenantContext->getCooperativeId()) {
                throw new DomainException('Bạn không có quyền truy cập dữ liệu của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
            }
        }

        return $land;
    }

    public function createLandContribution(string $memberId, array $data): LandContributionModel
    {
        $member = $this->memberService->getMemberById($memberId);

        $area = (float) $data['land_area_sqm'];
        $unitPrice = (float) $data['appraised_unit_price'];
        $totalValue = isset($data['total_land_value']) && (float) $data['total_land_value'] > 0
            ? (float) $data['total_land_value']
            : round($area * $unitPrice, 2);

        return DB::transaction(function () use ($member, $data, $area, $unitPrice, $totalValue) {
            // 1. Create a capital contribution header record of type LAND
            $capitalContribution = CapitalContributionModel::create([
                'id' => (string) Str::uuid(),
                'member_id' => $member->id,
                'contribution_type' => 'LAND',
                'amount' => $totalValue,
                'actual_amount' => $totalValue,
                'transaction_date' => now()->format('Y-m-d'),
                'status' => 'APPROVED',
                'value_description' => "Góp vốn quyền sử dụng đất: Thửa {$data['plot_number']}, TBĐ {$data['map_sheet_number']}, GCN {$data['land_certificate_no']}",
            ]);

            // 2. Create the land contribution detail record
            $land = LandContributionModel::create([
                'id' => (string) Str::uuid(),
                'contribution_id' => $capitalContribution->id,
                'land_certificate_no' => $data['land_certificate_no'],
                'plot_number' => $data['plot_number'],
                'map_sheet_number' => $data['map_sheet_number'],
                'land_area_sqm' => $area,
                'land_use_type' => $data['land_use_type'],
                'appraised_unit_price' => $unitPrice,
                'total_land_value' => $totalValue,
                'cadastral_status' => $data['cadastral_status'] ?? 'PENDING',
            ]);

            // Update credit limit based on land area (15M VND / ha)
            if ($area > 0) {
                $landHa = $area / 10000.0;
                $suggestedCredit = $landHa * 15000000.0;
                if ($suggestedCredit > (float) ($member->credit_limit ?? 0)) {
                    $member->update(['credit_limit' => $suggestedCredit]);
                }
            }

            $this->auditService->log(
                action: 'LAND_CONTRIBUTION_CREATED',
                entityType: 'LandContribution',
                entityId: $land->id,
                after: $land->toArray(),
                cooperativeId: $member->cooperative_id
            );

            return $land->load('contribution.member');
        });
    }

    public function deleteLandContribution(string $id): void
    {
        $land = $this->getLandContributionById($id);
        $coopId = $land->contribution?->member?->cooperative_id;
        $snapshot = $land->toArray();

        DB::transaction(function () use ($land) {
            $contribution = $land->contribution;
            $land->delete();
            if ($contribution) {
                $contribution->delete();
            }
        });

        $this->auditService->log(
            action: 'LAND_CONTRIBUTION_DELETED',
            entityType: 'LandContribution',
            entityId: $id,
            before: $snapshot,
            after: null,
            cooperativeId: $coopId
        );
    }
}
