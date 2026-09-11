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

        $harvest = HarvestModel::create([
            'id' => $domainEntity->id,
            'crop_season_id' => $domainEntity->cropSeasonId,
            'plot_id' => $domainEntity->plotId,
            'harvest_date' => $domainEntity->harvestDate,
            'quantity' => $domainEntity->quantity,
            'unit' => $domainEntity->unit,
            'quality_information' => $domainEntity->qualityInformation,
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
            throw new DomainException(
                "Cảnh báo an toàn PHI: Thửa đất đang trong thời gian cách ly sử dụng vật tư đến hết ngày [{$safetyDateStr}]. Ngày thu hoạch [{$harvestDate}] chưa đủ điều kiện an toàn!",
                'PHI_ISOLATION_VIOLATION',
                null,
                400
            );
        }
    }
}
