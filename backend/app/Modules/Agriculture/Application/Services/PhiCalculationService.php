<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\CalculatePhiDTO;
use Modules\Agriculture\Domain\Entities\PhiCalculation;
use Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class PhiCalculationService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly FarmingLogService $logService,
        private readonly AuditService $auditService
    ) {}

    public function listPhiCalculationsByLog(string $logId): Collection
    {
        $log = $this->logService->getLogById($logId);

        return PhiCalculationModel::with('material')
            ->where('farming_log_id', $log->id)
            ->get();
    }

    public function getPhiCalculationById(string $id): PhiCalculationModel
    {
        $calc = PhiCalculationModel::with(['farmingLog.cropSeason.productionUnit.cooperative', 'material'])->find($id);

        if (!$calc) {
            throw new DomainException('Kết quả tính toán PHI không tồn tại', 'PHI_CALCULATION_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $calc->farmingLog->cropSeason->productionUnit->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập dữ liệu PHI của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $calc;
    }

    public function calculateAndSave(CalculatePhiDTO $dto): PhiCalculationModel
    {
        $log = $this->logService->getLogById($dto->farmingLogId);

        $matQuery = MaterialModel::query();
        if ($this->tenantContext->hasTenant()) {
            $matQuery->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }
        $material = $matQuery->where('id', $dto->materialId)->first();

        if (!$material) {
            throw new DomainException('Vật tư không tồn tại hoặc thuộc Hợp tác xã khác', 'MATERIAL_NOT_FOUND', null, 404);
        }

        // Determine configured PHI days: Priority DTO -> Material safety_information -> null
        $configuredDays = $dto->configuredPhiDays;
        if ($configuredDays === null && isset($material->safety_information['phi_days'])) {
            $configuredDays = (int) $material->safety_information['phi_days'];
        }

        $domainEntity = new PhiCalculation(
            id: (string) Str::uuid(),
            farmingLogId: $log->id,
            materialId: $material->id,
            applicationDate: $dto->applicationDate,
            configuredPhiDays: $configuredDays,
            sourceReference: $dto->sourceReference
        );

        $calc = PhiCalculationModel::create([
            'id' => $domainEntity->id,
            'farming_log_id' => $domainEntity->farmingLogId,
            'material_id' => $domainEntity->materialId,
            'application_date' => $domainEntity->applicationDate,
            'configured_phi_days' => $domainEntity->configuredPhiDays,
            'safety_date' => $domainEntity->safetyDate,
            'status' => $domainEntity->status,
            'source_reference' => $domainEntity->sourceReference,
            'created_at' => now(),
        ]);

        $this->auditService->log(
            action: 'PHI_CALCULATION_CREATED',
            entityType: 'PhiCalculation',
            entityId: $calc->id,
            after: $calc->toArray(),
            cooperativeId: $log->cropSeason->productionUnit->cooperative_id
        );

        return $calc->load('material');
    }
}
