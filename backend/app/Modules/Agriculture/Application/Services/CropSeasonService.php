<?php

namespace Modules\Agriculture\Application\Services;

use Illuminate\Support\Facades\DB;
use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\CreateCropSeasonDTO;
use Modules\Agriculture\Application\DTOs\UpdateCropSeasonDTO;
use Modules\Agriculture\Domain\Entities\CropSeason;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonBomModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;

class CropSeasonService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly ProductionUnitService $unitService,
        private readonly AuditService $auditService
    ) {}

    public function listSeasons(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = CropSeasonModel::with('productionUnit');

        if ($this->tenantContext->hasTenant()) {
            $tenantId = $this->tenantContext->getCooperativeId();
            $query->whereHas('productionUnit', function ($q) use ($tenantId) {
                $q->where('cooperative_id', $tenantId);
            });
        }

        if (!empty($filters['production_unit_id'])) {
            $query->where('production_unit_id', $filters['production_unit_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';

        if (!empty($filters['crop'])) {
            $query->where('crop', $likeOp, '%' . trim($filters['crop']) . '%');
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('name', $likeOp, $search)
                  ->orWhere('crop', $likeOp, $search);
            });
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['created_at', 'start_date', 'expected_end_date', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getSeasonById(string $id): CropSeasonModel
    {
        $season = CropSeasonModel::with(['productionUnit.cooperative', 'farmingLogs'])->find($id);

        if (!$season) {
            throw new DomainException('Mùa vụ sản xuất không tồn tại', 'CROP_SEASON_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $season->productionUnit->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Mùa vụ sản xuất không tồn tại', 'CROP_SEASON_NOT_FOUND', null, 404);
        }

        return $season;
    }

    public function createSeason(CreateCropSeasonDTO $dto): CropSeasonModel
    {
        $unit = $this->unitService->getProductionUnitById($dto->productionUnitId);

        $domainEntity = new CropSeason(
            id: (string) Str::uuid(),
            productionUnitId: $unit->id,
            name: $dto->name,
            crop: $dto->crop,
            startDate: $dto->startDate,
            expectedEndDate: $dto->expectedEndDate,
            status: 'PLANNED',
            planInformation: $dto->planInformation
        );

        $season = CropSeasonModel::create([
            'id' => $domainEntity->id,
            'production_unit_id' => $domainEntity->productionUnitId,
            'name' => $domainEntity->name,
            'crop' => $domainEntity->crop,
            'start_date' => $domainEntity->startDate,
            'expected_end_date' => $domainEntity->expectedEndDate,
            'status' => $domainEntity->status,
            'plan_information' => $domainEntity->planInformation,
            'seed_supplier' => $dto->seedSupplier,
            'seedling_standard_checklist' => $dto->seedlingStandardChecklist,
            'buyer_contract_info' => $dto->buyerContractInfo,
            'puc_quota_kg' => $dto->pucQuotaKg,
        ]);

        $this->auditService->log(
            action: 'CROP_SEASON_CREATED',
            entityType: 'CropSeason',
            entityId: $season->id,
            after: $season->toArray(),
            cooperativeId: $unit->cooperative_id
        );

        return $season->load('productionUnit');
    }

    public function updateSeason(string $id, UpdateCropSeasonDTO $dto): CropSeasonModel
    {
        $season = $this->getSeasonById($id);

        if ($season->status === 'COMPLETED' || $season->status === 'CANCELLED') {
            throw new DomainException('Không thể chỉnh sửa mùa vụ đã kết thúc hoặc đã hủy', 'SEASON_CLOSED', null, 400);
        }

        if ($dto->status !== null && $dto->status !== $season->status) {
            $allowed = [
                'PLANNED' => ['ACTIVE', 'CANCELLED'],
                'ACTIVE' => ['HARVESTING', 'CANCELLED'],
                'HARVESTING' => ['CANCELLED'],
            ];
            if (!in_array($dto->status, $allowed[$season->status] ?? [], true)) {
                throw new DomainException('Không thể chuyển trạng thái mùa vụ từ ' . $season->status . ' sang ' . $dto->status, 'INVALID_STATUS_TRANSITION', null, 400);
            }
        }

        $before = $season->toArray();
        $updates = [];

        if ($dto->name !== null) $updates['name'] = $dto->name;
        if ($dto->crop !== null) $updates['crop'] = $dto->crop;
        if ($dto->startDate !== null) $updates['start_date'] = $dto->startDate;
        if ($dto->expectedEndDate !== null) {
            $startDate = $dto->startDate ?: $season->start_date->format('Y-m-d');
            if ($dto->expectedEndDate <= $startDate) {
                throw new DomainException('Ngày dự kiến kết thúc phải sau ngày bắt đầu mùa vụ', 'INVALID_SEASON_DATES', null, 400);
            }
            $updates['expected_end_date'] = $dto->expectedEndDate;
        }
        if ($dto->status !== null) $updates['status'] = $dto->status;
        if ($dto->planInformation !== null) $updates['plan_information'] = $dto->planInformation;
        if ($dto->seedSupplier !== null) $updates['seed_supplier'] = $dto->seedSupplier;
        if ($dto->seedlingStandardChecklist !== null) $updates['seedling_standard_checklist'] = $dto->seedlingStandardChecklist;
        if ($dto->buyerContractInfo !== null) $updates['buyer_contract_info'] = $dto->buyerContractInfo;
        if ($dto->pucQuotaKg !== null) $updates['puc_quota_kg'] = $dto->pucQuotaKg;

        if (!empty($updates)) {
            $season->update($updates);

            $this->auditService->log(
                action: 'CROP_SEASON_UPDATED',
                entityType: 'CropSeason',
                entityId: $season->id,
                before: $before,
                after: $season->toArray(),
                cooperativeId: $season->productionUnit->cooperative_id
            );
        }

        return $season->fresh('productionUnit');
    }

    public function closeSeason(string $id, ?string $actualEndDate = null): CropSeasonModel
    {
        $seasonModel = $this->getSeasonById($id);

        $domainEntity = new CropSeason(
            id: $seasonModel->id,
            productionUnitId: $seasonModel->production_unit_id,
            name: $seasonModel->name,
            crop: $seasonModel->crop,
            startDate: $seasonModel->start_date->format('Y-m-d'),
            expectedEndDate: $seasonModel->expected_end_date->format('Y-m-d'),
            actualEndDate: $seasonModel->actual_end_date?->format('Y-m-d'),
            status: $seasonModel->status,
            planInformation: $seasonModel->plan_information
        );

        $before = $seasonModel->toArray();
        $domainEntity->close($actualEndDate);

        $seasonModel->update([
            'status' => $domainEntity->status,
            'actual_end_date' => $domainEntity->actualEndDate,
        ]);

        $this->auditService->log(
            action: 'CROP_SEASON_CLOSED',
            entityType: 'CropSeason',
            entityId: $seasonModel->id,
            before: $before,
            after: $seasonModel->toArray(),
            cooperativeId: $seasonModel->productionUnit->cooperative_id
        );

        return $seasonModel->fresh('productionUnit');
    }

    public function getAllocatedPlots(string $seasonId): \Illuminate\Support\Collection
    {
        $season = $this->getSeasonById($seasonId);
        return CropSeasonPlotModel::with(['plot', 'member.user'])
            ->where('crop_season_id', $season->id)
            ->orderBy('planting_date', 'asc')
            ->get();
    }

    public function allocatePlot(string $seasonId, array $data): CropSeasonPlotModel
    {
        $season = $this->getSeasonById($seasonId);
        $plot = FarmPlotModel::find($data['plot_id']);

        if (!$plot) {
            throw new DomainException('Thửa đất không tồn tại', 'PLOT_NOT_FOUND', null, 404);
        }

        if ($plot->production_unit_id !== $season->production_unit_id) {
            throw new DomainException('Thửa đất không thuộc vùng sản xuất của mùa vụ này', 'PLOT_UNIT_MISMATCH', null, 400);
        }

        if (!empty($data['member_id'])) {
            $member = MemberModel::find($data['member_id']);
            if (!$member || ($this->tenantContext->hasTenant() && $member->cooperative_id !== $this->tenantContext->getCooperativeId())) {
                throw new DomainException('Xã viên không hợp lệ hoặc không thuộc HTX này', 'INVALID_MEMBER', null, 400);
            }
        }

        // Tính sản lượng mục tiêu mặc định nếu chưa nhập (m2 * năng suất định mức)
        $allocatedArea = (float) $data['allocated_area'];
        $allocatedAreaM2 = $allocatedArea < 100 ? $allocatedArea * 10000 : $allocatedArea;
        $targetYield = isset($data['target_yield_kg']) && (float) $data['target_yield_kg'] > 0
            ? (float) $data['target_yield_kg']
            : round($allocatedAreaM2 * (float) ($plot->max_yield_rate_per_sqm ?? 4.5), 2);

        $allocation = CropSeasonPlotModel::updateOrCreate(
            [
                'crop_season_id' => $season->id,
                'plot_id' => $plot->id,
            ],
            [
                'member_id' => $data['member_id'] ?? null,
                'allocated_area' => $allocatedAreaM2,
                'crop_variety' => $data['crop_variety'] ?? $season->crop,
                'planting_date' => $data['planting_date'],
                'expected_harvest_start' => $data['expected_harvest_start'],
                'expected_harvest_end' => $data['expected_harvest_end'],
                'target_yield_kg' => $targetYield,
                'status' => $data['status'] ?? 'PLANNED',
                'notes' => $data['notes'] ?? null,
            ]
        );

        $this->auditService->log(
            action: 'CROP_SEASON_PLOT_ALLOCATED',
            entityType: 'CropSeasonPlot',
            entityId: $allocation->id,
            after: $allocation->toArray(),
            cooperativeId: $season->productionUnit->cooperative_id
        );

        return $allocation->load(['plot', 'member.user']);
    }

    public function removePlotAllocation(string $seasonId, string $plotId): void
    {
        $season = $this->getSeasonById($seasonId);

        $allocation = CropSeasonPlotModel::where('crop_season_id', $season->id)
            ->where('plot_id', $plotId)
            ->first();

        if (!$allocation) {
            throw new DomainException('Phân bổ thửa đất không tồn tại', 'ALLOCATION_NOT_FOUND', null, 404);
        }

        $hasLogs = FarmingLogModel::where('crop_season_id', $season->id)
            ->where('plot_id', $plotId)
            ->exists();
        $hasHarvests = HarvestModel::where('crop_season_id', $season->id)
            ->where('plot_id', $plotId)
            ->exists();

        if ($hasLogs || $hasHarvests) {
            throw new DomainException('Không thể hủy phân bổ thửa đất đã có nhật ký canh tác hoặc sản lượng thu hoạch', 'CANNOT_REMOVE_ACTIVE_ALLOCATION', null, 400);
        }

        $before = $allocation->toArray();
        $allocation->delete();

        $this->auditService->log(
            action: 'CROP_SEASON_PLOT_REMOVED',
            entityType: 'CropSeasonPlot',
            entityId: $allocation->id,
            before: $before,
            cooperativeId: $season->productionUnit->cooperative_id
        );
    }

    public function getSeasonBoms(string $seasonId): \Illuminate\Support\Collection
    {
        $season = $this->getSeasonById($seasonId);
        return CropSeasonBomModel::with('material')
            ->where('crop_season_id', $season->id)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function saveSeasonBom(string $seasonId, array $items): \Illuminate\Support\Collection
    {
        $season = $this->getSeasonById($seasonId);

        return DB::transaction(function () use ($season, $items) {
            CropSeasonBomModel::where('crop_season_id', $season->id)->delete();

            $savedBoms = collect();
            foreach ($items as $item) {
                $plannedQty = (float) $item['planned_quantity'];
                $unitPrice = isset($item['estimated_unit_price']) ? (float) $item['estimated_unit_price'] : 0;
                $totalCost = isset($item['estimated_total_cost']) && (float) $item['estimated_total_cost'] > 0
                    ? (float) $item['estimated_total_cost']
                    : round($plannedQty * $unitPrice, 2);

                $bom = CropSeasonBomModel::create([
                    'crop_season_id' => $season->id,
                    'material_id' => $item['material_id'],
                    'stage_phase' => $item['stage_phase'] ?? 'GENERAL',
                    'standard_rate_per_sqm' => isset($item['standard_rate_per_sqm']) ? (float) $item['standard_rate_per_sqm'] : 0,
                    'planned_quantity' => $plannedQty,
                    'issued_quantity' => isset($item['issued_quantity']) ? (float) $item['issued_quantity'] : 0,
                    'estimated_unit_price' => $unitPrice,
                    'estimated_total_cost' => $totalCost,
                    'notes' => $item['notes'] ?? null,
                ]);
                $savedBoms->push($bom);
            }

            $this->auditService->log(
                action: 'CROP_SEASON_BOM_SAVED',
                entityType: 'CropSeasonBom',
                entityId: $season->id,
                after: ['item_count' => count($items)],
                cooperativeId: $season->productionUnit->cooperative_id
            );

            return CropSeasonBomModel::with('material')
                ->where('crop_season_id', $season->id)
                ->get();
        });
    }

    public function getSupplyDemandBalance(string $seasonId): array
    {
        $season = $this->getSeasonById($seasonId);

        $contractKg = (float) ($season->buyer_contract_info['target_volume_kg'] 
            ?? $season->buyer_contract_info['contract_volume_kg'] 
            ?? $season->puc_quota_kg 
            ?? 0);
        $buyerName = $season->buyer_contract_info['buyer_name'] ?? 'Chưa xác định';
        $phcCode = $season->buyer_contract_info['phc_code'] ?? null;

        $totalCommittedKg = (float) CropSeasonPlotModel::where('crop_season_id', $season->id)->sum('target_yield_kg');
        $harvestSum = (float) HarvestModel::where('crop_season_id', $season->id)->sum('quantity');
        $plotActualSum = (float) CropSeasonPlotModel::where('crop_season_id', $season->id)->sum('actual_harvested_kg');
        $totalActualKg = max($harvestSum, $plotActualSum);

        $fulfillmentRate = $contractKg > 0 ? round(($totalActualKg / $contractKg) * 100, 1) : 0;
        $commitmentCoverage = $contractKg > 0 ? round(($totalCommittedKg / $contractKg) * 100, 1) : 0;
        $gapKg = $totalCommittedKg - $contractKg;

        // Cảnh báo gian lận sản lượng trà trộn ngoài vùng PUC (> 125% mức cam kết)
        $anomalyHigh = $totalCommittedKg > 0 && $totalActualKg > (1.25 * $totalCommittedKg);
        // Cảnh báo mất mùa hoặc tuồn hàng tự do (< 50% khi đã đóng vụ)
        $anomalyLow = $totalCommittedKg > 0 && $season->status === 'COMPLETED' && $totalActualKg < (0.50 * $totalCommittedKg);

        return [
            'crop_season_id' => $season->id,
            'season_name' => $season->name,
            'buyer_name' => $buyerName,
            'phc_code' => $phcCode,
            'buyer_contract_quantity_kg' => $contractKg,
            'total_committed_quantity_kg' => $totalCommittedKg,
            'total_actual_harvested_kg' => $totalActualKg,
            'fulfillment_rate_percent' => $fulfillmentRate,
            'commitment_coverage_percent' => $commitmentCoverage,
            'commitment_gap_kg' => $gapKg,
            'is_shortage' => $totalCommittedKg < $contractKg,
            'is_surplus' => $totalCommittedKg > $contractKg,
            'anomaly_high_yield' => $anomalyHigh,
            'anomaly_low_yield' => $anomalyLow,
        ];
    }

    public function bulkAllocatePlots(string $seasonId, array $plotIds, array $commonData = []): \Illuminate\Support\Collection
    {
        $season = $this->getSeasonById($seasonId);

        if (empty($plotIds)) {
            throw new DomainException('Danh sách thửa đất phân bổ không được rỗng', 'EMPTY_PLOT_IDS', null, 400);
        }

        $plots = FarmPlotModel::with('landRelation')
            ->whereIn('id', $plotIds)
            ->get();

        if ($plots->isEmpty()) {
            throw new DomainException('Không tìm thấy thửa đất nào hợp lệ', 'PLOTS_NOT_FOUND', null, 404);
        }

        foreach ($plots as $p) {
            if ($p->production_unit_id !== $season->production_unit_id) {
                throw new DomainException("Thửa đất [{$p->plot_code}] không thuộc vùng sản xuất của mùa vụ này", 'PLOT_UNIT_MISMATCH', null, 400);
            }
        }

        $plantingDate = $commonData['planting_date'] ?? ($season->start_date ? $season->start_date->format('Y-m-d') : now()->toDateString());
        $cropVariety = $commonData['crop_variety'] ?? $season->crop;
        $status = $commonData['status'] ?? 'PLANNED';

        // Mặc định ngày thu hoạch: sau 75 ngày đến ngày kết thúc vụ
        $harvestStart = $commonData['expected_harvest_start'] ?? \Carbon\Carbon::parse($plantingDate)->addDays(75)->toDateString();
        $harvestEnd = $commonData['expected_harvest_end'] ?? ($season->expected_end_date ? $season->expected_end_date->format('Y-m-d') : \Carbon\Carbon::parse($harvestStart)->addDays(45)->toDateString());

        return DB::transaction(function () use ($season, $plots, $plantingDate, $harvestStart, $harvestEnd, $cropVariety, $status, $commonData) {
            $createdAllocations = collect();

            foreach ($plots as $plot) {
                $areaNum = (float) $plot->area;
                $areaM2 = $areaNum < 100 ? $areaNum * 10000 : $areaNum;
                $targetYield = round($areaM2 * (float) ($plot->max_yield_rate_per_sqm ?? 4.5), 2);

                $memberId = $commonData['member_id'] ?? $plot->landRelation?->member_id;

                $allocation = CropSeasonPlotModel::updateOrCreate(
                    [
                        'crop_season_id' => $season->id,
                        'plot_id' => $plot->id,
                    ],
                    [
                        'member_id' => $memberId,
                        'allocated_area' => $areaM2,
                        'crop_variety' => $cropVariety,
                        'planting_date' => $plantingDate,
                        'expected_harvest_start' => $harvestStart,
                        'expected_harvest_end' => $harvestEnd,
                        'target_yield_kg' => $targetYield,
                        'status' => $status,
                        'notes' => $commonData['notes'] ?? 'Phân bổ hàng loạt theo vùng sản xuất',
                    ]
                );

                $createdAllocations->push($allocation);
            }

            $this->auditService->log(
                action: 'CROP_SEASON_PLOTS_BULK_ALLOCATED',
                entityType: 'CropSeason',
                entityId: $season->id,
                after: ['allocated_count' => $createdAllocations->count()],
                cooperativeId: $season->productionUnit->cooperative_id
            );

            return CropSeasonPlotModel::with(['plot', 'member.user'])
                ->where('crop_season_id', $season->id)
                ->whereIn('plot_id', $plots->pluck('id'))
                ->get();
        });
    }

    public function getBomPresets(?string $crop = null): array
    {
        $coopId = $this->tenantContext->getCooperativeId();

        // Lấy danh mục vật tư hiện có trong HTX để map SKU/ID nếu có
        $availableMaterials = \Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel::where('cooperative_id', $coopId)
            ->get(['id', 'sku', 'name', 'unit', 'price', 'category']);

        $findMat = function(string $keyword, string $category = '') use ($availableMaterials) {
            $matched = $availableMaterials->first(function ($m) use ($keyword) {
                return str_contains(mb_strtolower($m->name), mb_strtolower($keyword)) || str_contains(mb_strtolower($m->sku), mb_strtolower($keyword));
            });
            if ($matched) {
                return [
                    'material_id' => $matched->id,
                    'material_name' => $matched->name,
                    'sku' => $matched->sku,
                    'unit' => $matched->unit,
                    'unit_price' => (float) ($matched->price ?? 0),
                ];
            }
            return [
                'material_id' => null,
                'material_name' => $keyword,
                'sku' => strtoupper(Str::slug($keyword)),
                'unit' => 'kg',
                'unit_price' => 35000,
            ];
        };

        return [
            [
                'preset_code' => 'PRESET_SWEET_PALERMO',
                'preset_name' => 'Quy trình VietGAP Ớt chuông Sweet Palermo (Công nghệ cao)',
                'applicable_crop' => 'Ớt chuông',
                'description' => 'Định mức 4 giai đoạn chuẩn GlobalGAP/VietGAP cho nhà màng công nghệ cao, kiểm soát PHI nghiêm ngặt.',
                'items' => [
                    [
                        'stage_phase' => 'SEEDLING',
                        'stage_name' => '1. Ươm cây & Bén rễ',
                        'material' => $findMat('Phân hữu cơ vi sinh Trùn Quế', 'FERTILIZER'),
                        'standard_rate_per_sqm' => 0.5,
                        'notes' => 'Bón lót đáy luống kết hợp xử lý nấm Trichoderma',
                    ],
                    [
                        'stage_phase' => 'VEGETATIVE',
                        'stage_name' => '2. Nuôi thân lá & Tạo tán',
                        'material' => $findMat('NPK 20-20-15', 'FERTILIZER'),
                        'standard_rate_per_sqm' => 0.08,
                        'notes' => 'Tưới nhỏ giọt EC 1.8 mS/cm định kỳ 5 ngày/lần',
                    ],
                    [
                        'stage_phase' => 'FLOWERING',
                        'stage_name' => '3. Ra hoa & Đậu quả lớn',
                        'material' => $findMat('Phân bón Kali Bo', 'FERTILIZER'),
                        'standard_rate_per_sqm' => 0.05,
                        'notes' => 'Tăng đậu quả, chống rụng hoa và nứt trái, ngọt Brix ≥ 7°',
                    ],
                    [
                        'stage_phase' => 'FRUITING',
                        'stage_name' => '4. Thu hoạch rộ & Phòng trừ sinh học',
                        'material' => $findMat('Chế phẩm sinh học Bacillus Thuringiensis (BT)', 'PESTICIDE'),
                        'standard_rate_per_sqm' => 0.01,
                        'notes' => 'Phòng trừ sâu xanh đục quả, thời gian cách ly PHI 3 ngày',
                    ],
                ]
            ],
            [
                'preset_code' => 'PRESET_CHERRY_TOMATO',
                'preset_name' => 'Quy trình VietGAP Cà chua bi / Cherry hữu cơ',
                'applicable_crop' => 'Cà chua',
                'description' => 'Quy trình canh tác giá thể xơ dừa tưới nhỏ giọt kiểm soát dinh dưỡng tự động.',
                'items' => [
                    [
                        'stage_phase' => 'SEEDLING',
                        'stage_name' => '1. Giá thể & Bén rễ',
                        'material' => $findMat('Giá thể xơ dừa đã xử lý mụn', 'FERTILIZER'),
                        'standard_rate_per_sqm' => 1.2,
                        'notes' => 'Xử lý sạch mầm bệnh, trộn nấm đối kháng',
                    ],
                    [
                        'stage_phase' => 'VEGETATIVE',
                        'stage_name' => '2. Nuôi thân cành',
                        'material' => $findMat('Canxi Nitrat Ca(NO3)2', 'FERTILIZER'),
                        'standard_rate_per_sqm' => 0.06,
                        'notes' => 'Chống thối đít trái, cứng cây giăng dây đỡ',
                    ],
                    [
                        'stage_phase' => 'FLOWERING',
                        'stage_name' => '3. Đậu chùm quả',
                        'material' => $findMat('NPK 15-5-20', 'FERTILIZER'),
                        'standard_rate_per_sqm' => 0.1,
                        'notes' => 'Bổ sung vi lượng Magie, Bo',
                    ],
                    [
                        'stage_phase' => 'FRUITING',
                        'stage_name' => '4. Chín đỏ & Thu hoạch',
                        'material' => $findMat('Dầu khoáng sinh học SK Enspray', 'PESTICIDE'),
                        'standard_rate_per_sqm' => 0.015,
                        'notes' => 'Kiểm soát nhện đỏ và bọ phấn trắng, an toàn thu hái',
                    ],
                ]
            ],
            [
                'preset_code' => 'PRESET_DURIAN_VIETGAP',
                'preset_name' => 'Quy trình VietGAP Sầu riêng Chuyên canh (Mã số PUC)',
                'applicable_crop' => 'Sầu riêng',
                'description' => 'Định mức phân bón hữu cơ và thuốc BVTV sinh học đạt chuẩn xuất khẩu chính ngạch.',
                'items' => [
                    [
                        'stage_phase' => 'VEGETATIVE',
                        'stage_name' => '1. Phục hồi sau thu hoạch & Làm đọt',
                        'material' => $findMat('Phân hữu cơ khoáng Humic', 'FERTILIZER'),
                        'standard_rate_per_sqm' => 0.15,
                        'notes' => 'Kích thích bộ rễ cám, bung đọt đồng loạt',
                    ],
                    [
                        'stage_phase' => 'FLOWERING',
                        'stage_name' => '2. Phân hóa mầm hoa & Mắt cua',
                        'material' => $findMat('Lân 86 Tạo mầm', 'FERTILIZER'),
                        'standard_rate_per_sqm' => 0.08,
                        'notes' => 'Xiết nước tạo mầm hoa, phun Bo ngừa rụng hoa',
                    ],
                    [
                        'stage_phase' => 'FRUITING',
                        'stage_name' => '3. Nuôi trái & Cơm vàng hạt lép',
                        'material' => $findMat('Phân bón Kali Sunfat K2SO4', 'FERTILIZER'),
                        'standard_rate_per_sqm' => 0.12,
                        'notes' => 'Tăng độ béo, chống sượng cơm, bón trước thu hoạch 20 ngày',
                    ],
                ]
            ],
        ];
    }
}

