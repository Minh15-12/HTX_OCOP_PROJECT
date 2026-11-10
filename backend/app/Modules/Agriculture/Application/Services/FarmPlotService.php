<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\AssignMemberPlotDTO;
use Modules\Agriculture\Application\DTOs\CreateFarmPlotDTO;
use Modules\Agriculture\Domain\Entities\FarmPlot;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\MemberPlotAssignmentModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;

class FarmPlotService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly ProductionUnitService $unitService,
        private readonly AuditService $auditService
    ) {}

    public function listAllPlots(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = FarmPlotModel::with(['productionUnit.cooperative', 'assignments.member']);

        if ($this->tenantContext->hasTenant()) {
            $tenantId = $this->tenantContext->getCooperativeId();
            $query->whereHas('productionUnit', function ($q) use ($tenantId) {
                $q->where('cooperative_id', $tenantId);
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['production_unit_id'])) {
            $query->where('production_unit_id', $filters['production_unit_id']);
        }

        if (!empty($filters['member_id'])) {
            $query->whereHas('assignments', function ($q) use ($filters) {
                $q->where('member_id', $filters['member_id']);
            });
        }

        if (!empty($filters['search'])) {
            $searchTerm = '%'.$filters['search'].'%';
            $query->where('plot_code', 'ilike', $searchTerm);
        }

        return $query->orderBy('plot_code', 'asc')->paginate(min(max($perPage, 1), 100));
    }

    public function listPlotsByMember(string $memberId): Collection
    {
        $query = FarmPlotModel::with(['productionUnit.cooperative', 'assignments.member']);

        if ($this->tenantContext->hasTenant()) {
            $tenantId = $this->tenantContext->getCooperativeId();
            $query->whereHas('productionUnit', function ($q) use ($tenantId) {
                $q->where('cooperative_id', $tenantId);
            });
        }

        $query->where(function ($sub) use ($memberId) {
            $sub->whereHas('assignments', function ($q) use ($memberId) {
                $q->where('member_id', $memberId);
            })->orWhere('land_relation->owner_id', $memberId);
        });

        return $query->orderBy('plot_code', 'asc')->get();
    }

    public function listPlotsByProductionUnit(string $unitId): Collection
    {
        $unit = $this->unitService->getProductionUnitById($unitId);

        return FarmPlotModel::with('assignments.member')
            ->where('production_unit_id', $unit->id)
            ->orderBy('plot_code', 'asc')
            ->get();
    }

    public function getPlotById(string $plotId): FarmPlotModel
    {
        $plot = FarmPlotModel::with(['productionUnit.cooperative', 'assignments.member'])->find($plotId);

        if (!$plot) {
            throw new DomainException('Thửa đất canh tác không tồn tại', 'PLOT_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $plot->productionUnit->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập thửa đất của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $plot;
    }

    public function createFarmPlot(CreateFarmPlotDTO $dto): FarmPlotModel
    {
        $unit = $this->unitService->getProductionUnitById($dto->productionUnitId);

        $domainEntity = new FarmPlot(
            id: (string) Str::uuid(),
            productionUnitId: $unit->id,
            plotCode: $dto->plotCode,
            area: $dto->area,
            landRelation: $dto->landRelation,
            status: 'ACTIVE'
        );

        $exists = FarmPlotModel::where('production_unit_id', $unit->id)
            ->where('plot_code', $domainEntity->plotCode)
            ->exists();

        if ($exists) {
            throw new DomainException("Mã thửa đất [{$domainEntity->plotCode}] đã tồn tại trong Vùng sản xuất này", 'DUPLICATE_PLOT_CODE', null, 409);
        }

        $plot = FarmPlotModel::create([
            'id' => $domainEntity->id,
            'production_unit_id' => $domainEntity->productionUnitId,
            'plot_code' => $domainEntity->plotCode,
            'area' => $domainEntity->area,
            'land_relation' => $domainEntity->landRelation,
            'national_cadastral_code' => $dto->nationalCadastralCode,
            'land_sheet_number' => $dto->landSheetNumber,
            'land_parcel_number' => $dto->landParcelNumber,
            'substrate_bag_count' => $dto->substrateBagCount,
            'planting_density_per_sqm' => $dto->plantingDensityPerSqm,
            'greenhouse_type' => $dto->greenhouseType,
            'geometry_geojson' => $dto->geometryGeojson,
            'vn2000_coordinates' => $dto->vn2000Coordinates,
            'max_yield_rate_per_sqm' => $dto->maxYieldRatePerSqm ?? 5.0,
            'land_contract_expired_at' => $dto->landContractExpiredAt,
            'status' => $domainEntity->status,
        ]);

        $this->auditService->log(
            action: 'FARM_PLOT_CREATED',
            entityType: 'FarmPlot',
            entityId: $plot->id,
            after: $plot->toArray(),
            cooperativeId: $unit->cooperative_id
        );

        return $plot->load('productionUnit');
    }

    public function assignMemberToPlot(string $plotId, AssignMemberPlotDTO $dto): MemberPlotAssignmentModel
    {
        $plot = $this->getPlotById($plotId);

        // Verify member belongs to same cooperative
        $query = MemberModel::query();
        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }
        $member = $query->where('id', $dto->memberId)->first();

        if (!$member) {
            throw new DomainException('Xã viên không tồn tại hoặc thuộc Hợp tác xã khác', 'MEMBER_NOT_FOUND', null, 404);
        }

        $assignment = MemberPlotAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $member->id,
            'plot_id' => $plot->id,
            'assignment_type' => $dto->assignmentType,
            'start_date' => $dto->startDate,
            'end_date' => $dto->endDate,
            'status' => 'ACTIVE',
        ]);

        $this->auditService->log(
            action: 'MEMBER_PLOT_ASSIGNED',
            entityType: 'MemberPlotAssignment',
            entityId: $assignment->id,
            after: $assignment->toArray(),
            cooperativeId: $plot->productionUnit->cooperative_id
        );

        return $assignment->load(['member', 'plot']);
    }

    public function listPlotMemberAssignments(string $plotId): Collection
    {
        $plot = $this->getPlotById($plotId);

        return MemberPlotAssignmentModel::with('member')
            ->where('plot_id', $plot->id)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    public function updateFarmPlot(string $plotId, array $data): FarmPlotModel
    {
        $plot = $this->getPlotById($plotId);
        $before = $plot->toArray();

        $fillable = array_intersect_key($data, array_flip([
            'plot_code', 'area', 'status', 'land_relation',
            'national_cadastral_code', 'land_sheet_number', 'land_parcel_number',
            'substrate_bag_count', 'planting_density_per_sqm', 'greenhouse_type',
            'geometry_geojson', 'vn2000_coordinates', 'max_yield_rate_per_sqm', 'land_contract_expired_at',
        ]));

        if (isset($fillable['plot_code']) && $fillable['plot_code'] !== $plot->plot_code) {
            $exists = FarmPlotModel::where('production_unit_id', $plot->production_unit_id)
                ->where('plot_code', $fillable['plot_code'])
                ->where('id', '!=', $plot->id)
                ->exists();
            if ($exists) {
                throw new DomainException("Mã thửa đất [{$fillable['plot_code']}] đã tồn tại trong Vùng sản xuất này", 'DUPLICATE_PLOT_CODE', null, 409);
            }
        }

        $plot->update($fillable);

        $this->auditService->log(
            action: 'FARM_PLOT_UPDATED',
            entityType: 'FarmPlot',
            entityId: $plot->id,
            before: $before,
            after: $plot->toArray(),
            cooperativeId: $plot->productionUnit->cooperative_id
        );

        return $plot->fresh(['productionUnit', 'assignments.member']);
    }

    public function deleteFarmPlot(string $plotId): bool
    {
        $plot = $this->getPlotById($plotId);

        // Foreign Key Guard: Do not allow hard-delete if farming logs or harvests exist
        $hasLogs = FarmingLogModel::where('plot_id', $plot->id)->exists();
        $hasHarvests = HarvestModel::where('plot_id', $plot->id)->exists();

        if ($hasLogs || $hasHarvests) {
            throw new DomainException(
                'Không thể xóa thửa đất đã có dữ liệu nhật ký canh tác hoặc sản lượng thu hoạch. Vui lòng chuyển trạng thái sang [NGƯNG CANH TÁC] hoặc [NGHỈ VỤ].',
                'ERR_PLOT_HAS_ACTIVITY_RECORDS',
                null,
                422
            );
        }

        $this->auditService->log(
            action: 'FARM_PLOT_DELETED',
            entityType: 'FarmPlot',
            entityId: $plot->id,
            before: $plot->toArray(),
            cooperativeId: $plot->productionUnit->cooperative_id
        );

        return (bool) $plot->delete();
    }
}
