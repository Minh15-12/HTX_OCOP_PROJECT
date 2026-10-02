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
}
