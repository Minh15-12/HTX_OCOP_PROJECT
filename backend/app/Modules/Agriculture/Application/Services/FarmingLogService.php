<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\CreateFarmingLogDTO;
use Modules\Agriculture\Application\DTOs\UpdateFarmingLogDTO;
use Modules\Agriculture\Domain\Entities\FarmingLog;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;

class FarmingLogService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly CropSeasonService $seasonService,
        private readonly FarmPlotService $plotService,
        private readonly AuditService $auditService
    ) {}

    public function listLogs(array $filters = [], int $perPage = 15, string $sort = '-activity_date'): LengthAwarePaginator
    {
        $query = FarmingLogModel::with(['cropSeason.productionUnit', 'plot', 'performer', 'material', 'materialUsages', 'phiCalculations']);

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

        if (!empty($filters['activity_type'])) {
            $query->where('activity_type', $filters['activity_type']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('activity_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('activity_date', '<=', $filters['date_to']);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['activity_date', 'created_at', 'activity_type'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('activity_date', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getLogById(string $id): FarmingLogModel
    {
        $log = FarmingLogModel::with(['cropSeason.productionUnit.cooperative', 'plot', 'performer', 'material', 'materialUsages', 'phiCalculations'])->find($id);

        if (!$log) {
            throw new DomainException('Nhật ký canh tác không tồn tại trong hệ thống', 'FARMING_LOG_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $log->cropSeason->productionUnit->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập nhật ký canh tác của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $log;
    }

    public function createLog(CreateFarmingLogDTO $dto): FarmingLogModel
    {
        $season = $this->seasonService->getSeasonById($dto->cropSeasonId);

        if ($season->status === 'COMPLETED' || $season->status === 'CANCELLED') {
            throw new DomainException('Không thể ghi nhật ký canh tác cho mùa vụ đã kết thúc', 'SEASON_CLOSED', null, 400);
        }

        $plot = $this->plotService->getPlotById($dto->plotId);

        // Invariant: Plot must belong to season's production unit
        if ($plot->production_unit_id !== $season->production_unit_id) {
            throw new DomainException('Thửa đất không thuộc Vùng sản xuất của mùa vụ này', 'PLOT_SEASON_MISMATCH', null, 400);
        }

        $domainEntity = new FarmingLog(
            id: (string) Str::uuid(),
            cropSeasonId: $season->id,
            plotId: $plot->id,
            activityType: $dto->activityType,
            activityDate: $dto->activityDate,
            description: $dto->description,
            performedBy: $dto->performedBy ?: (auth()->check() ? auth()->id() : null),
            attachmentReference: $dto->attachmentReference
        );

        // BR-FARM-003: Spraying activities require GPS coordinates
        if (in_array(strtoupper($dto->activityType), ['SPRAYING', 'PHUN_THUOC'], true)) {
            if ($dto->gpsLatitude === null || $dto->gpsLongitude === null) {
                throw new DomainException('Nhật ký phun thuốc bảo vệ thực vật bắt buộc phải cung cấp tọa độ GPS', 'ERR_GPS_LOCATION_REQUIRED', null, 422);
            }
        }

        $log = FarmingLogModel::create([
            'id' => $domainEntity->id,
            'crop_season_id' => $domainEntity->cropSeasonId,
            'plot_id' => $domainEntity->plotId,
            'activity_type' => $domainEntity->activityType,
            'activity_date' => $domainEntity->activityDate,
            'description' => $domainEntity->description,
            'performed_by' => $domainEntity->performedBy,
            'attachment_reference' => $domainEntity->attachmentReference,
            'material_id' => $dto->materialId,
            'material_batch_number' => $dto->materialBatchNumber,
            'quantity_applied' => $dto->quantityApplied,
            'unit' => $dto->unit,
            'phi_days' => $dto->phiDays,
            'gps_latitude' => $dto->gpsLatitude,
            'gps_longitude' => $dto->gpsLongitude,
        ]);

        if ($dto->phiDays && $dto->phiDays > 0) {
            $appDate = \Carbon\Carbon::parse($dto->activityDate);
            $safetyDate = $appDate->copy()->addDays($dto->phiDays)->format('Y-m-d');
            
            \Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel::create([
                'id' => (string) Str::uuid(),
                'farming_log_id' => $log->id,
                'material_id' => $dto->materialId,
                'application_date' => $dto->activityDate,
                'configured_phi_days' => $dto->phiDays,
                'safety_date' => $safetyDate,
                'status' => 'ACTIVE',
                'source_reference' => ['source' => 'FARMING_LOG', 'log_id' => $log->id],
                'created_at' => now(),
            ]);

            // PHI Guard Lock: Lock plot to IN_QUARANTINE until safety_date
            $plot->update([
                'status' => 'IN_QUARANTINE',
                'quarantine_until' => $safetyDate,
            ]);
        }

        $this->auditService->log(
            action: 'FARMING_LOG_CREATED',
            entityType: 'FarmingLog',
            entityId: $log->id,
            after: $log->toArray(),
            cooperativeId: $season->productionUnit->cooperative_id
        );

        return $log->load(['cropSeason.productionUnit', 'plot', 'performer', 'material', 'phiCalculations']);
    }

    public function updateLog(string $id, UpdateFarmingLogDTO $dto): FarmingLogModel
    {
        $log = $this->getLogById($id);

        if ($log->cropSeason->status === 'COMPLETED' || $log->cropSeason->status === 'CANCELLED') {
            throw new DomainException('Không thể cập nhật nhật ký canh tác của mùa vụ đã đóng', 'SEASON_CLOSED', null, 400);
        }

        $before = $log->toArray();
        $updates = [];

        if ($dto->activityType !== null) {
            $logEntity = new FarmingLog(
                id: $log->id,
                cropSeasonId: $log->crop_season_id,
                plotId: $log->plot_id,
                activityType: $dto->activityType,
                activityDate: $dto->activityDate ?: $log->activity_date->format('Y-m-d')
            );
            $updates['activity_type'] = $logEntity->activityType;
        }

        if ($dto->activityDate !== null) $updates['activity_date'] = $dto->activityDate;
        if ($dto->description !== null) $updates['description'] = $dto->description;
        if ($dto->performedBy !== null) $updates['performed_by'] = $dto->performedBy;
        if ($dto->attachmentReference !== null) $updates['attachment_reference'] = $dto->attachmentReference;
        if ($dto->materialId !== null) $updates['material_id'] = $dto->materialId;
        if ($dto->materialBatchNumber !== null) $updates['material_batch_number'] = $dto->materialBatchNumber;
        if ($dto->quantityApplied !== null) $updates['quantity_applied'] = $dto->quantityApplied;
        if ($dto->unit !== null) $updates['unit'] = $dto->unit;
        if ($dto->phiDays !== null) $updates['phi_days'] = $dto->phiDays;
        if ($dto->gpsLatitude !== null) $updates['gps_latitude'] = $dto->gpsLatitude;
        if ($dto->gpsLongitude !== null) $updates['gps_longitude'] = $dto->gpsLongitude;

        if (!empty($updates)) {
            $log->update($updates);

            if (isset($updates['phi_days']) && $updates['phi_days'] > 0) {
                $actDate = $updates['activity_date'] ?? $log->activity_date->format('Y-m-d');
                $appDate = \Carbon\Carbon::parse($actDate);
                $safetyDate = $appDate->copy()->addDays($updates['phi_days'])->format('Y-m-d');

                \Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel::updateOrCreate(
                    ['farming_log_id' => $log->id],
                    [
                        'material_id' => $updates['material_id'] ?? $log->material_id,
                        'application_date' => $actDate,
                        'configured_phi_days' => $updates['phi_days'],
                        'safety_date' => $safetyDate,
                        'status' => 'ACTIVE',
                        'source_reference' => ['source' => 'FARMING_LOG', 'log_id' => $log->id],
                        'created_at' => now(),
                    ]
                );
            }

            $this->auditService->log(
                action: 'FARMING_LOG_UPDATED',
                entityType: 'FarmingLog',
                entityId: $log->id,
                before: $before,
                after: $log->toArray(),
                cooperativeId: $log->cropSeason->productionUnit->cooperative_id
            );
        }

        return $log->fresh(['cropSeason.productionUnit', 'plot', 'performer', 'material', 'phiCalculations']);
    }
}
