<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\CreateHarvestDTO;
use Modules\Agriculture\Application\DTOs\UpdateHarvestDTO;
use Modules\Agriculture\Domain\Entities\Harvest;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;

class HarvestService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly CropSeasonService $seasonService,
        private readonly FarmPlotService $plotService,
        private readonly AuditService $auditService
    ) {}

    public function listHarvests(array $filters = [], int $perPage = 15, string $sort = '-harvest_date'): LengthAwarePaginator
    {
        $query = HarvestModel::with(['cropSeason.productionUnit', 'plot', 'lot']);

        if ($this->tenantContext->hasTenant()) {
            $tenantId = $this->tenantContext->getCooperativeId();
            $query->whereHas('cropSeason.productionUnit', function ($q) use ($tenantId) {
                $q->where('cooperative_id', $tenantId);
            });
        }

        if (!empty($filters['crop_season_id'])) {
            $query->where('crop_season_id', $filters['crop_season_id']);
        }

        if (!empty($filters['plot_id'])) {
            $query->where('plot_id', $filters['plot_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('harvest_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('harvest_date', '<=', $filters['date_to']);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['harvest_date', 'created_at', 'quantity'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('harvest_date', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getHarvestById(string $id): HarvestModel
    {
        $harvest = HarvestModel::with(['cropSeason.productionUnit.cooperative', 'plot', 'lot'])->find($id);

        if (!$harvest) {
            throw new DomainException('Bản ghi thu hoạch không tồn tại trong hệ thống', 'HARVEST_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $harvest->cropSeason->productionUnit->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập dữ liệu thu hoạch của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $harvest;
    }

    public function createHarvest(CreateHarvestDTO $dto): HarvestModel
    {
        $season = $this->seasonService->getSeasonById($dto->cropSeasonId);
        $plot = $this->plotService->getPlotById($dto->plotId);

        if ($plot->production_unit_id !== $season->production_unit_id) {
            throw new DomainException('Thửa đất không thuộc Vùng sản xuất của mùa vụ này', 'PLOT_SEASON_MISMATCH', null, 400);
        }

        // --- PHI PRE-HARVEST SAFETY CHECK ---
        $this->verifyPhiSafety($season->id, $plot->id, $dto->harvestDate);

        $domainEntity = new Harvest(
            id: (string) Str::uuid(),
            cropSeasonId: $season->id,
            plotId: $plot->id,
            harvestDate: $dto->harvestDate,
            quantity: $dto->quantity,
            unit: $dto->unit,
            qualityInformation: $dto->qualityInformation
        );

        $grade = $dto->grade ?? 'GRADE_B';
        if ($dto->brixLevel !== null && $dto->uniformityRate !== null) {
            if ($dto->uniformityRate >= 90.0 && $dto->brixLevel >= 7.0) {
                $grade = 'GRADE_A';
            } else {
                $grade = 'GRADE_B';
            }
        }
        if (($dto->kcsQuickLab['status'] ?? '') === 'LAB_REJECTED' || ($dto->kcsQuickLab['test_result'] ?? '') === 'LAB_REJECTED') {
            $grade = 'REJECT';
        }

        $qualityInfo = $dto->qualityInformation ?? [];
        $qualityInfo['grade_a_kg'] = ($grade === 'GRADE_A') ? ($dto->gradeAKg !== null ? (float) $dto->gradeAKg : (float) $dto->quantity) : 0.0;
        $qualityInfo['grade_b_kg'] = $dto->gradeBKg !== null ? (float) $dto->gradeBKg : ($grade === 'GRADE_B' ? (float) $dto->quantity : 0.0);
        $qualityInfo['reject_kg'] = $dto->rejectKg !== null ? (float) $dto->rejectKg : ($grade === 'REJECT' ? (float) $dto->quantity : 0.0);
        if ($dto->brixLevel !== null) $qualityInfo['brix_level'] = $dto->brixLevel;
        if ($dto->uniformityRate !== null) $qualityInfo['uniformity_rate'] = $dto->uniformityRate;
        $maxStage = HarvestModel::where('crop_season_id', $season->id)->where('plot_id', $plot->id)->max('stage_number');
        $stageNumber = $dto->stageNumber ?? (($maxStage ?? 0) + 1);

        $latestSprayLog = FarmingLogModel::where('crop_season_id', $season->id)
            ->where('plot_id', $plot->id)
            ->whereNotNull('active_ingredient')
            ->where('activity_date', '<=', $dto->harvestDate)
            ->orderBy('activity_date', 'desc')
            ->first();

        $lastSprayDate = $latestSprayLog?->activity_date;
        $lastActiveIngredient = $latestSprayLog?->active_ingredient;
        $daysSinceLastSpray = $lastSprayDate ? \Carbon\Carbon::parse($dto->harvestDate)->diffInDays($lastSprayDate) : null;
        $weighingSlip = $dto->weighingSlipCode ?? ('PC-SK-' . strtoupper(substr(str_replace('-', '', (string) Str::uuid()), 0, 6)));

        // Anti-fraud: calculate ecological harvest quota & detect over-quota
        $harvestQty = (float) $domainEntity->quantity;
        $accumulated = (float) HarvestModel::where('plot_id', $plot->id)
            ->where('crop_season_id', $season->id)
            ->sum('quantity');
        $totalProjected = $accumulated + $harvestQty;
        $plotQuota = $plot->calculateHarvestQuota();

        $isOverQuota = false;
        $quotaExcessKg = 0.0;
        $quotaAuditStatus = 'APPROVED';
        $quotaAuditNote = null;

        if ($plotQuota > 0 && $totalProjected > $plotQuota) {
            $isOverQuota = true;
            $quotaExcessKg = round($totalProjected - $plotQuota, 2);
            $quotaAuditStatus = 'NEEDS_RECONCILIATION';
            $quotaAuditNote = "Sản lượng lũy kế ({$totalProjected} kg) vượt định mức trần sinh thái ({$plotQuota} kg) của thửa đất [{$plot->plot_code}]. Cần Ban Kiểm Soát đối soát thực địa.";
        }

        $harvest = HarvestModel::create([
            'id' => $domainEntity->id,
            'crop_season_id' => $domainEntity->cropSeasonId,
            'plot_id' => $domainEntity->plotId,
            'stage_number' => $stageNumber,
            'harvest_date' => $domainEntity->harvestDate,
            'last_spray_date' => $lastSprayDate,
            'last_active_ingredient' => $lastActiveIngredient,
            'days_since_last_spray' => $daysSinceLastSpray,
            'weighing_slip_code' => $weighingSlip,
            'quantity' => $domainEntity->quantity,
            'rejection_weight_kg' => $dto->rejectionWeightKg ?? 0,
            'unit' => $domainEntity->unit,
            'quality_information' => $qualityInfo,
            'kcs_status' => $dto->kcsStatus ?? 'PENDING_KCS',
            'kcs_gate_check' => $dto->kcsGateCheck,
            'kcs_quick_lab' => $dto->kcsQuickLab,
            'grade' => $grade,
            'brix_level' => $dto->brixLevel,
            'uniformity_rate' => $dto->uniformityRate,
            'is_over_quota' => $isOverQuota,
            'quota_excess_kg' => $quotaExcessKg,
            'quota_audit_status' => $quotaAuditStatus,
            'quota_audit_note' => $quotaAuditNote,
        ]);

        $this->auditService->log(
            action: 'HARVEST_CREATED',
            entityType: 'Harvest',
            entityId: $harvest->id,
            after: $harvest->toArray(),
            cooperativeId: $season->productionUnit->cooperative_id
        );

        return $harvest->load(['cropSeason.productionUnit', 'plot']);
    }

    public function updateHarvest(string $id, UpdateHarvestDTO $dto): HarvestModel
    {
        $harvest = $this->getHarvestById($id);
        $before = $harvest->toArray();

        $updates = [];
        if ($dto->harvestDate !== null) {
            $this->verifyPhiSafety($harvest->crop_season_id, $harvest->plot_id, $dto->harvestDate);
            $updates['harvest_date'] = $dto->harvestDate;
        }

        if ($dto->quantity !== null) {
            if ($dto->quantity <= 0) {
                throw new DomainException('Sản lượng thu hoạch phải lớn hơn 0', 'INVALID_HARVEST_QUANTITY', null, 400);
            }
            $updates['quantity'] = $dto->quantity;
        }

        if ($dto->unit !== null) $updates['unit'] = $dto->unit;
        if ($dto->qualityInformation !== null) $updates['quality_information'] = $dto->qualityInformation;
        if ($dto->kcsStatus !== null) $updates['kcs_status'] = $dto->kcsStatus;
        if ($dto->kcsGateCheck !== null) $updates['kcs_gate_check'] = $dto->kcsGateCheck;
        if ($dto->kcsQuickLab !== null) $updates['kcs_quick_lab'] = $dto->kcsQuickLab;
        if ($dto->grade !== null) $updates['grade'] = $dto->grade;
        if ($dto->brixLevel !== null) $updates['brix_level'] = $dto->brixLevel;
        if ($dto->uniformityRate !== null) $updates['uniformity_rate'] = $dto->uniformityRate;

        // Handle grade and kg updates if provided
        $currentQuality = $updates['quality_information'] ?? $harvest->quality_information ?? [];
        $effectiveGrade = $dto->grade ?? $harvest->grade;
        if ($effectiveGrade !== 'GRADE_A') {
            $currentQuality['grade_a_kg'] = 0.0;
        } elseif ($dto->gradeAKg !== null) {
            $currentQuality['grade_a_kg'] = (float) $dto->gradeAKg;
        }
        if ($dto->gradeBKg !== null) $currentQuality['grade_b_kg'] = (float) $dto->gradeBKg;
        if ($dto->rejectKg !== null) $currentQuality['reject_kg'] = (float) $dto->rejectKg;
        if ($dto->brixLevel !== null) $currentQuality['brix_level'] = $dto->brixLevel;
        if ($dto->uniformityRate !== null) $currentQuality['uniformity_rate'] = $dto->uniformityRate;
        if ($dto->stageNumber !== null) $updates['stage_number'] = $dto->stageNumber;
        if ($dto->weighingSlipCode !== null) $updates['weighing_slip_code'] = $dto->weighingSlipCode;
        if ($dto->rejectionWeightKg !== null) $updates['rejection_weight_kg'] = $dto->rejectionWeightKg;

        if (!empty($updates)) {
            $harvest->update($updates);

            $this->auditService->log(
                action: 'HARVEST_UPDATED',
                entityType: 'Harvest',
                entityId: $harvest->id,
                before: $before,
                after: $harvest->toArray(),
                cooperativeId: $harvest->cropSeason->productionUnit->cooperative_id
            );
        }

        return $harvest->fresh(['cropSeason.productionUnit', 'plot', 'lot']);
    }

    public function gateCheck(string $id, array $params = []): HarvestModel
    {
        $harvest = $this->getHarvestById($id);
        $harvestDate = $params['harvest_date'] ?? $harvest->harvest_date->format('Y-m-d');

        // Gate Check: Enforce PHI safety check; if harvest_date < safe_harvest_date, throw ERR_HARVEST_PHI_VIOLATION (HTTP 400)
        $this->verifyPhiSafety($harvest->crop_season_id, $harvest->plot_id, $harvestDate);

        $before = $harvest->toArray();
        $gateCheckData = array_merge([
            'passed' => true,
            'phi_checked' => true,
            'safe_harvest_date' => $harvestDate,
            'harvest_date' => $harvestDate,
            'checked_at' => now()->toIso8601String(),
            'note' => $params['note'] ?? 'Cổng nông trường: Đạt đối soát an toàn PHI',
        ], $params);

        $harvest->update([
            'kcs_status' => 'GATE_PASSED',
            'kcs_gate_check' => $gateCheckData,
        ]);

        $this->auditService->log(
            action: 'HARVEST_GATE_CHECK_PASSED',
            entityType: 'Harvest',
            entityId: $harvest->id,
            before: $before,
            after: $harvest->toArray(),
            cooperativeId: $harvest->cropSeason->productionUnit->cooperative_id
        );

        return $harvest->fresh(['cropSeason.productionUnit', 'plot', 'lot']);
    }

    public function quickLab(string $id, array $params = []): HarvestModel
    {
        $harvest = $this->getHarvestById($id);
        $before = $harvest->toArray();

        $status = strtoupper($params['status'] ?? $params['test_result'] ?? 'LAB_PASSED');
        $testKit = $params['test_kit'] ?? $params['kit_code'] ?? 'KIT-AGRO-2026';
        $ppm = isset($params['ppm']) ? (float) $params['ppm'] : (isset($params['residue_ppm']) ? (float) $params['residue_ppm'] : 0.001);

        $quickLabData = [
            'status' => $status,
            'test_result' => $status,
            'test_kit' => $testKit,
            'kit_code' => $testKit,
            'ppm' => $ppm,
            'residue_ppm' => $ppm,
            'active_substances_tested' => $params['active_substances_tested'] ?? ['Chlorpyrifos', 'Imidacloprid'],
            'tested_at' => $params['tested_at'] ?? now()->toIso8601String(),
            'tester_name' => $params['tester_name'] ?? 'Tổ KCS HTX Tân Tiến',
            'note' => $params['note'] ?? ($status === 'LAB_PASSED' ? 'Đạt kiểm nghiệm an toàn dư lượng' : 'Vi phạm dư lượng hóa chất cấm'),
        ];

        $updates = [
            'kcs_status' => $status,
            'kcs_quick_lab' => $quickLabData,
        ];

        if ($status === 'LAB_REJECTED') {
            $updates['grade'] = 'REJECT';
            $qualityInfo = $harvest->quality_information ?? [];
            $qualityInfo['grade_a_kg'] = 0.0;
            $qualityInfo['grade_b_kg'] = 0.0;
            $qualityInfo['reject_kg'] = (float) $harvest->quantity;
            $qualityInfo['final_grade'] = 'REJECT';
            $updates['quality_information'] = $qualityInfo;
        }

        $harvest->update($updates);

        $this->auditService->log(
            action: 'HARVEST_QUICK_LAB_RECORDED',
            entityType: 'Harvest',
            entityId: $harvest->id,
            before: $before,
            after: $harvest->toArray(),
            cooperativeId: $harvest->cropSeason->productionUnit->cooperative_id
        );

        return $harvest->fresh(['cropSeason.productionUnit', 'plot', 'lot']);
    }

    public function grading(string $id, array $params = []): HarvestModel
    {
        $harvest = $this->getHarvestById($id);
        $before = $harvest->toArray();

        $brixLevel = isset($params['brix_level']) ? (float) $params['brix_level'] : 0.0;
        $uniformityRate = isset($params['uniformity_rate']) ? (float) $params['uniformity_rate'] : 0.0;

        // If previously rejected in quick lab or marked REJECT, remain REJECT
        if (($harvest->kcs_quick_lab['status'] ?? '') === 'LAB_REJECTED' || $harvest->grade === 'REJECT') {
            $finalGrade = 'REJECT';
            $gradeAKg = 0.0;
            $gradeBKg = 0.0;
            $rejectKg = (float) $harvest->quantity;
        } else {
            // Grade A requires uniformity >= 90% and Brix >= 7
            if ($uniformityRate >= 90.0 && $brixLevel >= 7.0) {
                $finalGrade = 'GRADE_A';
                $gradeAKg = isset($params['grade_a_kg']) ? (float) $params['grade_a_kg'] : (float) $harvest->quantity;
                $gradeBKg = isset($params['grade_b_kg']) ? (float) $params['grade_b_kg'] : 0.0;
                $rejectKg = isset($params['reject_kg']) ? (float) $params['reject_kg'] : 0.0;
            } else {
                $finalGrade = 'GRADE_B';
                $gradeAKg = 0.0;
                $gradeBKg = isset($params['grade_b_kg']) ? (float) $params['grade_b_kg'] : (float) $harvest->quantity;
                $rejectKg = isset($params['reject_kg']) ? (float) $params['reject_kg'] : 0.0;
            }
        }

        if ($finalGrade !== 'GRADE_A') {
            $gradeAKg = 0.0;
        }

        $qualityInfo = array_merge($harvest->quality_information ?? [], [
            'grade_a_kg' => ($finalGrade === 'GRADE_A') ? $gradeAKg : 0.0,
            'grade_b_kg' => $gradeBKg,
            'reject_kg' => $rejectKg,
            'brix_level' => $brixLevel,
            'uniformity_rate' => $uniformityRate,
            'final_grade' => $finalGrade,
        ]);

        $harvest->update([
            'grade' => $finalGrade,
            'brix_level' => $brixLevel,
            'uniformity_rate' => $uniformityRate,
            'kcs_status' => 'GRADED',
            'quality_information' => $qualityInfo,
        ]);

        $this->auditService->log(
            action: 'HARVEST_GRADED',
            entityType: 'Harvest',
            entityId: $harvest->id,
            before: $before,
            after: $harvest->toArray(),
            cooperativeId: $harvest->cropSeason->productionUnit->cooperative_id
        );

        return $harvest->fresh(['cropSeason.productionUnit', 'plot', 'lot']);
    }

    private function verifyPhiSafety(string $seasonId, string $plotId, string $harvestDate): void
    {
        $logIds = FarmingLogModel::where('crop_season_id', $seasonId)
            ->where('plot_id', $plotId)
            ->pluck('id');

        if ($logIds->isEmpty()) {
            return;
        }

        $activeIsolation = PhiCalculationModel::whereIn('farming_log_id', $logIds)
            ->where('safety_date', '>', $harvestDate)
            ->orderBy('safety_date', 'desc')
            ->first();

        if ($activeIsolation) {
            $safetyDateStr = $activeIsolation->safety_date->format('Y-m-d');

            $season = $this->seasonService->getSeasonById($seasonId);
            $this->auditService->log(
                action: 'PHI_VIOLATION_ATTEMPTED',
                entityType: 'Harvest',
                entityId: $plotId,
                after: [
                    'crop_season_id' => $seasonId,
                    'plot_id' => $plotId,
                    'harvest_date' => $harvestDate,
                    'safety_date' => $safetyDateStr,
                    'active_isolation_id' => $activeIsolation->id,
                ],
                cooperativeId: $season->productionUnit->cooperative_id
            );

            throw new DomainException(
                "Cảnh báo an toàn PHI: Thửa đất đang trong thời gian cách ly sử dụng vật tư đến hết ngày [{$safetyDateStr}]. Ngày thu hoạch [{$harvestDate}] chưa đủ điều kiện an toàn!",
                'ERR_HARVEST_PHI_VIOLATION',
                null,
                400
            );
        }
    }

    public function auditQuota(string $id, string $status, ?string $note = null): HarvestModel
    {
        $harvest = $this->getHarvestById($id);
        $before = $harvest->toArray();

        $harvest->update([
            'quota_audit_status' => $status,
            'quota_audit_note' => $note,
        ]);

        $this->auditService->log(
            action: 'HARVEST_QUOTA_AUDITED',
            entityType: 'Harvest',
            entityId: $harvest->id,
            before: $before,
            after: $harvest->toArray(),
            cooperativeId: $harvest->cropSeason->productionUnit->cooperative_id
        );

        return $harvest->fresh(['cropSeason.productionUnit', 'plot', 'lot']);
    }
}
