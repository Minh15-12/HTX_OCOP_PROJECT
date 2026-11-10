<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\CreateMaterialUsageDTO;
use Modules\Agriculture\Domain\Entities\MaterialUsage;
use Modules\Agriculture\Infrastructure\Persistence\Models\MaterialUsageModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class MaterialUsageService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly FarmingLogService $logService,
        private readonly AuditService $auditService
    ) {}

    public function listUsagesByLog(string $logId): Collection
    {
        $log = $this->logService->getLogById($logId);

        return MaterialUsageModel::with('material')
            ->where('farming_log_id', $log->id)
            ->get();
    }

    public function getUsageById(string $id): MaterialUsageModel
    {
        $usage = MaterialUsageModel::with(['farmingLog.cropSeason.productionUnit.cooperative', 'material'])->find($id);

        if (!$usage) {
            throw new DomainException('Thông tin vật tư sử dụng không tồn tại', 'MATERIAL_USAGE_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $usage->farmingLog->cropSeason->productionUnit->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập dữ liệu của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $usage;
    }

    public function createUsage(CreateMaterialUsageDTO $dto): MaterialUsageModel
    {
        $log = $this->logService->getLogById($dto->farmingLogId);

        if ($log->cropSeason->status === 'COMPLETED' || $log->cropSeason->status === 'CANCELLED') {
            throw new DomainException('Không thể thêm vật tư sử dụng vào nhật ký của mùa vụ đã đóng', 'SEASON_CLOSED', null, 400);
        }

        // Verify material belongs to same tenant
        $matQuery = MaterialModel::query();
        if ($this->tenantContext->hasTenant()) {
            $matQuery->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }
        $material = $matQuery->where('id', $dto->materialId)->first();

        if (!$material) {
            throw new DomainException('Vật tư không tồn tại hoặc thuộc Hợp tác xã khác', 'MATERIAL_NOT_FOUND', null, 404);
        }

        $domainEntity = new MaterialUsage(
            id: (string) Str::uuid(),
            farmingLogId: $log->id,
            materialId: $material->id,
            quantity: $dto->quantity,
            unit: $dto->unit,
            batchReference: $dto->batchReference
        );

        $usage = MaterialUsageModel::create([
            'id' => $domainEntity->id,
            'farming_log_id' => $domainEntity->farmingLogId,
            'material_id' => $domainEntity->materialId,
            'quantity' => $domainEntity->quantity,
            'unit' => $domainEntity->unit,
            'batch_reference' => $domainEntity->batchReference,
        ]);

        $this->auditService->log(
            action: 'MATERIAL_USAGE_CREATED',
            entityType: 'MaterialUsage',
            entityId: $usage->id,
            after: $usage->toArray(),
            cooperativeId: $log->cropSeason->productionUnit->cooperative_id
        );

        return $usage->load('material');
    }

    public function deleteUsage(string $id): void
    {
        $usage = $this->getUsageById($id);

        if ($usage->farmingLog->cropSeason->status === 'COMPLETED' || $usage->farmingLog->cropSeason->status === 'CANCELLED') {
            throw new DomainException('Không thể xóa vật tư sử dụng của mùa vụ đã đóng', 'SEASON_CLOSED', null, 400);
        }

        $before = $usage->toArray();
        $coopId = $usage->farmingLog->cropSeason->productionUnit->cooperative_id;

        $usage->delete();

        $this->auditService->log(
            action: 'MATERIAL_USAGE_DELETED',
            entityType: 'MaterialUsage',
            entityId: $id,
            before: $before,
            cooperativeId: $coopId
        );
    }
}
