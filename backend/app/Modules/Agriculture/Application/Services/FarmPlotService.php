<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\AssignMemberPlotDTO;
use Modules\Agriculture\Application\DTOs\CreateFarmPlotDTO;
use Modules\Agriculture\Domain\Entities\FarmPlot;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\MemberPlotAssignmentModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
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
}
