<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\DB;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\MemberPlotAssignmentModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Finance\Application\Services\ReceivablePayableService;

class HarvestSettlementService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly ReceivablePayableService $receivablePayableService,
        private readonly AuditService $auditService
    ) {}

    /**
     * Aggregate Grade A and Grade B harvest quantities for a crop season
     * and settle member payout after deducting warehouse credit advance (debt offset).
     */
    public function settleSeasonHarvests(
        string $seasonId,
        string $memberId,
        float $gradeAPrice = 35000,
        float $gradeBPrice = 25000,
        float $serviceFeeRate = 0.025
    ): array {
        $season = CropSeasonModel::with('productionUnit')->find($seasonId);
        if (!$season) {
            throw new DomainException('Không tìm thấy thông tin mùa vụ canh tác', 'SEASON_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $season->productionUnit->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền quyết toán mùa vụ của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        // Identify plots assigned to the member in this production unit
        $assignedPlotIds = MemberPlotAssignmentModel::where('member_id', $memberId)->pluck('plot_id');

        if ($assignedPlotIds->isEmpty()) {
            throw new DomainException('Xã viên không được phân công canh tác thửa đất nào trong mùa vụ này', 'ERR_MEMBER_NO_ASSIGNED_PLOTS', null, 400);
        }

        $harvestQuery = HarvestModel::where('crop_season_id', $seasonId)
            ->whereIn('plot_id', $assignedPlotIds);

        $harvests = $harvestQuery->get();
        if ($harvests->isEmpty()) {
            throw new DomainException('Không có đợt thu hoạch nào của xã viên trong mùa vụ này', 'ERR_NO_HARVESTS_FOUND', null, 400);
        }

        // Idempotency guard: filter out harvests already settled
        $unsettledHarvests = $harvests->reject(fn($h) => !empty($h->quality_information['is_settled']));
        if ($unsettledHarvests->isEmpty()) {
            throw new DomainException('Tất cả các đợt thu hoạch của xã viên trong mùa vụ này đã được quyết toán trước đó', 'ERR_HARVESTS_ALREADY_SETTLED', null, 400);
        }

        // Aggregate Grade A, Grade B and Reject quantities for unsettled harvests
        $totalGradeA = 0.0;
        $totalGradeB = 0.0;
        $totalReject = 0.0;

        foreach ($unsettledHarvests as $h) {
            $totalGradeA += (float) $h->grade_a_kg;
            $totalGradeB += (float) $h->grade_b_kg;
            $totalReject += (float) $h->reject_kg;
        }

        // Produce value formula: V_total = (Q_A * P_A) + (Q_B * P_B)
        $grossProduceValue = ($totalGradeA * $gradeAPrice) + ($totalGradeB * $gradeBPrice);

        if ($grossProduceValue <= 0) {
            throw new DomainException('Giá trị nông sản thu mua không hợp lệ hoặc không có sản lượng đạt tiêu chuẩn', 'ERR_FINANCE_INVALID_SETTLEMENT', null, 400);
        }

        return DB::transaction(function () use (
            $season,
            $seasonId,
            $memberId,
            $totalGradeA,
            $totalGradeB,
            $totalReject,
            $grossProduceValue,
            $gradeAPrice,
            $gradeBPrice,
            $serviceFeeRate,
            $unsettledHarvests
        ) {
            // Settle debt offset with Finance module
            $settlementResult = $this->receivablePayableService->offsetHarvestDebt(
                memberId: $memberId,
                harvestProduceValue: $grossProduceValue,
                serviceFeeRate: $serviceFeeRate
            );

            // Mark harvests as settled for idempotency
            $settledAt = now()->toIso8601String();
            foreach ($unsettledHarvests as $h) {
                $qualityInfo = $h->quality_information ?? [];
                $qualityInfo['is_settled'] = true;
                $qualityInfo['settled_at'] = $settledAt;
                $h->update(['quality_information' => $qualityInfo]);
            }

            $this->auditService->log(
                action: 'SEASON_HARVEST_SETTLEMENT_COMPLETED',
                entityType: 'CropSeason',
                entityId: $seasonId,
                after: [
                    'member_id' => $memberId,
                    'total_grade_a_kg' => $totalGradeA,
                    'total_grade_b_kg' => $totalGradeB,
                    'total_reject_kg' => $totalReject,
                    'gross_produce_value' => $grossProduceValue,
                    'settlement' => $settlementResult,
                ],
                cooperativeId: $season->productionUnit->cooperative_id
            );

            return [
                'season_id' => $seasonId,
                'member_id' => $memberId,
                'season_name' => $season->name,
                'harvest_count' => $unsettledHarvests->count(),
                'total_grade_a_kg' => round($totalGradeA, 2),
                'total_grade_b_kg' => round($totalGradeB, 2),
                'total_reject_kg' => round($totalReject, 2),
                'grade_a_price' => $gradeAPrice,
                'grade_b_price' => $gradeBPrice,
                'gross_produce_value' => round($grossProduceValue, 2),
                'service_fee' => $settlementResult['service_fee'],
                'total_debt_offset' => $settlementResult['total_debt_offset'],
                'net_payout' => $settlementResult['net_payout'],
                'remaining_member_debt' => $settlementResult['remaining_member_debt'],
            ];
        });
    }

    public function listSeasonSettlements(array $filters = []): array
    {
        $coopId = $this->tenantContext->hasTenant() ? $this->tenantContext->getCooperativeId() : null;

        $query = \Modules\Finance\Infrastructure\Persistence\Models\DebtSettlementModel::with([
            'debt',
            'cashTransaction'
        ])->where(function ($q) {
            $q->where('payment_method', 'HARVEST_OFFSET')
              ->orWhere('settlement_type', 'HARVEST_OFFSET');
        });

        if ($coopId) {
            $query->where(function ($q) use ($coopId) {
                $q->where('cooperative_id', $coopId)
                  ->orWhereHas('debt', fn($dq) => $dq->where('cooperative_id', $coopId));
            });
        }

        $settlements = $query->orderBy('settlement_date', 'desc')->get();

        return $settlements->map(function ($s) {
            return [
                'id' => $s->id,
                'settlement_date' => $s->settlement_date ? (is_string($s->settlement_date) ? $s->settlement_date : $s->settlement_date->format('Y-m-d')) : date('Y-m-d'),
                'amount' => (float) $s->amount,
                'payment_method' => $s->payment_method,
                'note' => $s->note,
                'debt_code' => $s->debt?->debt_code ?? 'CN-001',
                'member_id' => $s->debt?->counterparty_id,
                'member_name' => $s->debt?->counterparty_name ?? 'Xã viên HTX',
                'voucher_number' => $s->cashTransaction?->voucher_number ?? 'PC-QT-001',
                'status' => $s->status ?? 'POSTED',
            ];
        })->toArray();
    }
}

