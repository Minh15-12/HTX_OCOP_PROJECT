<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\CreateFarmingLogDTO;
use Modules\Agriculture\Application\DTOs\UpdateFarmingLogDTO;
use Modules\Agriculture\Domain\Entities\FarmingLog;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogItemModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;

class FarmingLogService
{
    /**
     * Danh mục 31 hoạt chất thuốc BVTV CẤM SỬ DỤNG tại Việt Nam theo Thông tư 75/2025/TT-BNNMT
     */
    public const BANNED_ACTIVE_INGREDIENTS = [
        'carbosulfan',
        'benfuracarb',
        'chlorpyrifos',
        'chlorpyrifos ethyl',
        'chlorpyrifos methyl',
        'paraquat',
        '2,4-d',
        'fipronil',
        'carbofuran',
        'endosulfan',
        'methomyl',
        'diazinon',
        'trichlorfon',
        'monocrotophos',
        'phosphamidon',
        'parathion',
        'methyl parathion',
        'aldicarb',
        'chlordimeform',
        'dicrotophos',
        'lindane',
        'ddt',
        'arsenic',
        'cadmium',
        'lead',
        'mercury',
        'hexachlorobenzene',
        'dieldrin',
        'aldrin',
        'heptachlor',
        'mirex',
    ];

    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly CropSeasonService $seasonService,
        private readonly FarmPlotService $plotService,
        private readonly AuditService $auditService
    ) {}

    public function listLogs(array $filters = [], int $perPage = 15, string $sort = '-activity_date'): LengthAwarePaginator
    {
        $query = FarmingLogModel::with([
            'cropSeason.productionUnit',
            'plot',
            'performer',
            'verifier',
            'material',
            'items.material',
            'materialUsages',
            'phiCalculations'
        ]);

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

        if (!empty($filters['status']) && $filters['status'] !== 'ALL') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['is_backdated'])) {
            $query->where('is_backdated', filter_var($filters['is_backdated'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['date_from'])) {
            $query->where('activity_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('activity_date', '<=', $filters['date_to']);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['activity_date', 'created_at', 'activity_type', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('activity_date', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getLogById(string $id): FarmingLogModel
    {
        $log = FarmingLogModel::with([
            'cropSeason.productionUnit.cooperative',
            'plot',
            'performer',
            'verifier',
            'material',
            'items.material',
            'materialUsages',
            'phiCalculations'
        ])->find($id);

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
        // 1. Kiểm tra Idempotency cho đồng bộ ngoại tuyến (Offline PWA)
        if ($dto->clientUuid) {
            $existing = FarmingLogModel::where('client_uuid', $dto->clientUuid)->first();
            if ($existing) {
                return $existing->load(['cropSeason.productionUnit', 'plot', 'performer', 'verifier', 'material', 'items', 'phiCalculations']);
            }
        }

        $season = $this->seasonService->getSeasonById($dto->cropSeasonId);

        if ($season->status === 'COMPLETED' || $season->status === 'CANCELLED') {
            throw new DomainException('Không thể ghi nhật ký canh tác cho mùa vụ đã kết thúc', 'SEASON_CLOSED', null, 400);
        }

        $plot = $this->plotService->getPlotById($dto->plotId);

        // Invariant: Thửa đất phải thuộc vùng sản xuất của mùa vụ
        if ($plot->production_unit_id !== $season->production_unit_id) {
            throw new DomainException('Thửa đất không thuộc Vùng sản xuất của mùa vụ này', 'PLOT_SEASON_MISMATCH', null, 400);
        }

        // 2. Kiểm tra GPS Geofencing (Tầng 1: Đa giác, Tầng 2: Vùng đệm 50m từ mép thửa đất)
        $geoCheck = $this->calculateGpsDistanceToPlot($plot, $dto->gpsLatitude, $dto->gpsLongitude);

        // BR-FARM-003: Phun thuốc bắt buộc phải có tọa độ GPS
        if (in_array(strtoupper($dto->activityType), ['SPRAYING', 'PHUN_THUOC'], true)) {
            if ($dto->gpsLatitude === null || $dto->gpsLongitude === null) {
                throw new DomainException('Nhật ký phun thuốc bảo vệ thực vật bắt buộc phải cung cấp tọa độ GPS thực địa', 'ERR_GPS_LOCATION_REQUIRED', null, 422);
            }
        }

        // 3. Kiểm tra Danh mục Hoạt chất Cấm (Thông tư 75/2025/TT-BNNMT)
        if ($dto->activeIngredient) {
            $this->checkBannedActiveIngredient($dto->activeIngredient);
        }

        if (!empty($dto->items) && is_array($dto->items)) {
            foreach ($dto->items as $it) {
                if (!empty($it['active_ingredient'])) {
                    $this->checkBannedActiveIngredient($it['active_ingredient']);
                }
            }
        }

        // 4. Kiểm tra quy tắc Ghi trễ nhật ký (Grace Period 48h - Quyết định Phương án A)
        $actDate = Carbon::parse($dto->activityDate);
        $diffHours = $actDate->diffInHours(now(), false);
        $isBackdated = $diffHours > 48; // Ghi lùi ngày quá 48h

        // Mặc định: Nếu là nông dân gửi ngoài đồng hoặc bị ghi lùi ngày -> Trạng thái SUBMITTED (chờ kiểm soát nội bộ duyệt)
        $status = $dto->status ?: ($isBackdated ? 'SUBMITTED' : 'VERIFIED');

        // 5. Xác định PHI và kiểm tra xung đột lịch thu hoạch (Proactive Collision Warning)
        $effectivePhi = $dto->phiDays ?? 0;
        if (!empty($dto->items) && is_array($dto->items)) {
            foreach ($dto->items as $it) {
                $itPhi = (int) ($it['phi_days'] ?? 0);
                if ($itPhi > $effectivePhi) {
                    $effectivePhi = $itPhi;
                }
            }
        } elseif (($effectivePhi === 0 || $effectivePhi === null) && $dto->materialId) {
            $mat = \Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel::find($dto->materialId);
            if ($mat && isset($mat->safety_information['phi_days']) && is_numeric($mat->safety_information['phi_days'])) {
                $effectivePhi = (int) $mat->safety_information['phi_days'];
            }
        }

        // Kiểm tra xung đột với kế hoạch thu hoạch hoặc hợp đồng bao tiêu
        $this->validateHarvestScheduleConflict($plot->id, $dto->activityDate, $effectivePhi);

        // 6. Tính toán Hash SHA-256 chuỗi bảo chứng toàn vẹn (Tamper-Evidence)
        $prevHash = FarmingLogModel::where('crop_season_id', $season->id)
            ->whereNotNull('hash_sha256')
            ->orderBy('created_at', 'desc')
            ->value('hash_sha256') ?? str_repeat('0', 64);

        $logId = (string) Str::uuid();
        $hashPayload = sprintf(
            '%s|%s|%s|%s|%s|%d|%s',
            $prevHash,
            $logId,
            $plot->id,
            $dto->activityType,
            $actDate->format('Y-m-d'),
            $effectivePhi,
            json_encode($dto->items ?? [])
        );
        $currentHash = hash('sha256', $hashPayload);

        return DB::transaction(function () use (
            $dto,
            $logId,
            $season,
            $plot,
            $actDate,
            $isBackdated,
            $status,
            $effectivePhi,
            $geoCheck,
            $prevHash,
            $currentHash
        ) {
            $log = FarmingLogModel::create([
                'id' => $logId,
                'client_uuid' => $dto->clientUuid,
                'crop_season_id' => $season->id,
                'plot_id' => $plot->id,
                'activity_type' => $dto->activityType,
                'fertigation_method' => $dto->fertigationMethod,
                'ec_solution' => $dto->ecSolution,
                'ec_drain' => $dto->ecDrain,
                'ph_solution' => $dto->phSolution,
                'tank_composition' => $dto->tankComposition,
                'pest_target' => $dto->pestTarget,
                'pest_density' => $dto->pestDensity,
                'active_ingredient' => $dto->activeIngredient,
                'resistance_group' => $dto->resistanceGroup,
                'material_lot_number' => $dto->materialLotNumber,
                'material_export_slip_code' => $dto->materialExportSlipCode,
                'biocontrol_agent_name' => $dto->biocontrolAgentName,
                'biocontrol_release_rate' => $dto->biocontrolReleaseRate,
                'water_volume_liters' => $dto->waterVolumeLiters,
                'application_equipment' => $dto->applicationEquipment,
                'status' => $status,
                'is_backdated' => $isBackdated,
                'verified_by' => $status === 'VERIFIED' ? (auth()->id() ?: null) : null,
                'verified_at' => $status === 'VERIFIED' ? now() : null,
                'activity_date' => $actDate->format('Y-m-d'),
                'description' => $dto->description,
                'voice_raw_text' => $dto->voiceRawText,
                'performed_by' => $dto->performedBy ?: (auth()->check() ? auth()->id() : null),
                'attachment_reference' => $dto->attachmentReference,
                'material_id' => $dto->materialId,
                'material_batch_number' => $dto->materialBatchNumber,
                'quantity_applied' => $dto->quantityApplied,
                'unit' => $dto->unit,
                'phi_days' => $effectivePhi,
                'gps_latitude' => $dto->gpsLatitude,
                'gps_longitude' => $dto->gpsLongitude,
                'gps_distance_to_edge_meters' => $geoCheck['distance'],
                'is_gps_verified' => $geoCheck['verified'],
                'prev_hash' => $prevHash,
                'hash_sha256' => $currentHash,
            ]);

            // Lưu danh mục Tank-mix nếu có
            if (!empty($dto->items) && is_array($dto->items)) {
                foreach ($dto->items as $item) {
                    FarmingLogItemModel::create([
                        'id' => (string) Str::uuid(),
                        'farming_log_id' => $log->id,
                        'material_id' => $item['material_id'] ?? null,
                        'material_name' => $item['material_name'] ?? 'Vật tư',
                        'item_type' => $item['item_type'] ?? 'PESTICIDE',
                        'active_ingredient' => $item['active_ingredient'] ?? null,
                        'resistance_group' => $item['resistance_group'] ?? null,
                        'quantity_applied' => $item['quantity_applied'] ?? 1,
                        'unit' => $item['unit'] ?? 'Lít',
                        'phi_days' => $item['phi_days'] ?? 0,
                        'material_lot_number' => $item['material_lot_number'] ?? null,
                        'material_export_slip_code' => $item['material_export_slip_code'] ?? null,
                    ]);
                }
            }

            // Xử lý cách ly PHI nếu có dùng hóa chất/thuốc
            if ($effectivePhi > 0) {
                $safetyDate = $actDate->copy()->addDays($effectivePhi)->format('Y-m-d');

                PhiCalculationModel::create([
                    'id' => (string) Str::uuid(),
                    'farming_log_id' => $log->id,
                    'material_id' => $dto->materialId,
                    'application_date' => $dto->activityDate,
                    'configured_phi_days' => $effectivePhi,
                    'safety_date' => $safetyDate,
                    'status' => 'ACTIVE',
                    'source_reference' => ['source' => 'FARMING_LOG', 'log_id' => $log->id],
                    'created_at' => now(),
                ]);

                // Khóa thửa đất sang trạng thái cách ly IN_QUARANTINE
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

            return $log->load(['cropSeason.productionUnit', 'plot', 'performer', 'verifier', 'material', 'items', 'phiCalculations']);
        });
    }

    public function updateLog(string $id, UpdateFarmingLogDTO $dto): FarmingLogModel
    {
        $log = $this->getLogById($id);

        if ($log->cropSeason->status === 'COMPLETED' || $log->cropSeason->status === 'CANCELLED') {
            throw new DomainException('Không thể cập nhật nhật ký canh tác của mùa vụ đã đóng', 'SEASON_CLOSED', null, 400);
        }

        $before = $log->toArray();
        $updates = [];

        if ($dto->activityType !== null) $updates['activity_type'] = $dto->activityType;
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

            $this->auditService->log(
                action: 'FARMING_LOG_UPDATED',
                entityType: 'FarmingLog',
                entityId: $log->id,
                before: $before,
                after: $log->toArray(),
                cooperativeId: $log->cropSeason->productionUnit->cooperative_id
            );
        }

        return $log->fresh(['cropSeason.productionUnit', 'plot', 'performer', 'verifier', 'material', 'items', 'phiCalculations']);
    }

    public function deleteLog(string $id): void
    {
        $log = $this->getLogById($id);

        if (in_array($log->cropSeason->status, ['COMPLETED', 'CANCELLED'], true)) {
            throw new DomainException('Không thể xóa nhật ký canh tác của mùa vụ đã đóng hoặc hủy', 'SEASON_CLOSED', null, 400);
        }

        $hasHarvest = \Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel::where('crop_season_id', $log->crop_season_id)
            ->where('plot_id', $log->plot_id)
            ->exists();

        if ($hasHarvest) {
            throw new DomainException('Không thể xóa nhật ký canh tác của thửa đất đã có biên bản thu hoạch', 'HARVEST_EXISTS', null, 400);
        }

        $snapshot = $log->toArray();
        $coopId = $log->cropSeason->productionUnit->cooperative_id;

        PhiCalculationModel::where('farming_log_id', $id)->delete();
        FarmingLogItemModel::where('farming_log_id', $id)->delete();

        $log->delete();

        $this->auditService->log(
            action: 'FARMING_LOG_DELETED',
            entityType: 'FarmingLog',
            entityId: $id,
            before: $snapshot,
            after: null,
            cooperativeId: $coopId
        );
    }

    /**
     * Duyệt thẩm định nhật ký canh tác (Hệ thống Kiểm soát Nội bộ - ICS)
     */
    public function verifyLog(string $id, ?string $verifierId, ?string $notes = null): FarmingLogModel
    {
        $log = $this->getLogById($id);

        $log->update([
            'status' => 'VERIFIED',
            'verified_by' => $verifierId ?: (auth()->check() ? auth()->id() : null),
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);

        $this->auditService->log(
            action: 'FARMING_LOG_VERIFIED',
            entityType: 'FarmingLog',
            entityId: $log->id,
            after: ['status' => 'VERIFIED', 'notes' => $notes],
            cooperativeId: $log->cropSeason->productionUnit->cooperative_id
        );

        return $log->fresh(['cropSeason.productionUnit', 'plot', 'performer', 'verifier', 'material', 'items', 'phiCalculations']);
    }

    /**
     * Từ chối thẩm định nhật ký canh tác (ICS Rejection)
     */
    public function rejectLog(string $id, ?string $verifierId, string $rejectionReason): FarmingLogModel
    {
        $log = $this->getLogById($id);

        $log->update([
            'status' => 'REJECTED',
            'verified_by' => $verifierId ?: (auth()->check() ? auth()->id() : null),
            'verified_at' => now(),
            'rejection_reason' => $rejectionReason,
        ]);

        // Nếu nhật ký bị từ chối, giải phóng trạng thái cách ly nếu không còn nhật ký nào khác
        PhiCalculationModel::where('farming_log_id', $id)->update(['status' => 'CANCELLED']);
        $this->recheckPlotQuarantineStatus($log->plot_id);

        $this->auditService->log(
            action: 'FARMING_LOG_REJECTED',
            entityType: 'FarmingLog',
            entityId: $log->id,
            after: ['status' => 'REJECTED', 'reason' => $rejectionReason],
            cooperativeId: $log->cropSeason->productionUnit->cooperative_id
        );

        return $log->fresh(['cropSeason.productionUnit', 'plot', 'performer', 'verifier', 'material', 'items', 'phiCalculations']);
    }

    /**
     * Đồng bộ ngoại tuyến hàng loạt (Offline PWA Sync)
     */
    public function batchSync(array $logs): array
    {
        $results = [];
        foreach ($logs as $index => $itemData) {
            try {
                $dto = new CreateFarmingLogDTO(
                    cropSeasonId: $itemData['crop_season_id'],
                    plotId: $itemData['plot_id'],
                    activityType: $itemData['activity_type'],
                    activityDate: $itemData['activity_date'],
                    description: $itemData['description'] ?? null,
                    performedBy: $itemData['performed_by'] ?? null,
                    attachmentReference: $itemData['attachment_reference'] ?? null,
                    materialId: $itemData['material_id'] ?? null,
                    materialBatchNumber: $itemData['material_batch_number'] ?? null,
                    quantityApplied: isset($itemData['quantity_applied']) ? (float)$itemData['quantity_applied'] : null,
                    unit: $itemData['unit'] ?? null,
                    phiDays: isset($itemData['phi_days']) ? (int)$itemData['phi_days'] : null,
                    gpsLatitude: isset($itemData['gps_latitude']) ? (float)$itemData['gps_latitude'] : null,
                    gpsLongitude: isset($itemData['gps_longitude']) ? (float)$itemData['gps_longitude'] : null,
                    fertigationMethod: $itemData['fertigation_method'] ?? null,
                    ecSolution: isset($itemData['ec_solution']) ? (float)$itemData['ec_solution'] : null,
                    ecDrain: isset($itemData['ec_drain']) ? (float)$itemData['ec_drain'] : null,
                    phSolution: isset($itemData['ph_solution']) ? (float)$itemData['ph_solution'] : null,
                    tankComposition: $itemData['tank_composition'] ?? null,
                    pestTarget: $itemData['pest_target'] ?? null,
                    pestDensity: $itemData['pest_density'] ?? null,
                    activeIngredient: $itemData['active_ingredient'] ?? null,
                    resistanceGroup: $itemData['resistance_group'] ?? null,
                    materialLotNumber: $itemData['material_lot_number'] ?? null,
                    materialExportSlipCode: $itemData['material_export_slip_code'] ?? null,
                    biocontrolAgentName: $itemData['biocontrol_agent_name'] ?? null,
                    biocontrolReleaseRate: $itemData['biocontrol_release_rate'] ?? null,
                    waterVolumeLiters: isset($itemData['water_volume_liters']) ? (float)$itemData['water_volume_liters'] : null,
                    applicationEquipment: $itemData['application_equipment'] ?? null,
                    clientUuid: $itemData['client_uuid'] ?? null,
                    items: $itemData['items'] ?? null,
                    voiceRawText: $itemData['voice_raw_text'] ?? null,
                    status: $itemData['status'] ?? 'SUBMITTED'
                );

                $created = $this->createLog($dto);
                $results[] = [
                    'index' => $index,
                    'client_uuid' => $itemData['client_uuid'] ?? null,
                    'server_id' => $created->id,
                    'status' => 'SUCCESS',
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'index' => $index,
                    'client_uuid' => $itemData['client_uuid'] ?? null,
                    'status' => 'ERROR',
                    'message' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Lấy danh mục 31 hoạt chất cấm theo Thông tư 75/2025/TT-BNNMT
     */
    public function getBannedPesticides(): array
    {
        return self::BANNED_ACTIVE_INGREDIENTS;
    }

    // =========================================================================
    // PRIVATE HELPER METHODS
    // =========================================================================

    private function checkBannedActiveIngredient(?string $ingredient): void
    {
        if (!$ingredient) return;
        $clean = mb_strtolower(trim($ingredient));
        foreach (self::BANNED_ACTIVE_INGREDIENTS as $banned) {
            if (str_contains($clean, $banned)) {
                throw new DomainException(
                    'Hoạt chất "' . $ingredient . '" nằm trong danh mục CẤM SỬ DỤNG theo Thông tư 75/2025/TT-BNNMT. Vui lòng dừng ngay hoạt động!',
                    'ERR_BANNED_PESTICIDE_VIOLATION',
                    null,
                    422
                );
            }
        }
    }

    private function validateHarvestScheduleConflict(string $plotId, string $activityDate, int $phiDays): void
    {
        if ($phiDays <= 0) return;

        $safeDate = Carbon::parse($activityDate)->addDays($phiDays)->format('Y-m-d');

        // Tìm lịch thu hoạch đã cam kết của thửa đất này
        $conflict = CropSeasonPlotModel::where('plot_id', $plotId)
            ->where('expected_harvest_start', '<=', $safeDate)
            ->where('expected_harvest_end', '>=', $activityDate)
            ->first();

        if ($conflict) {
            // Không chặn cứng nhưng ghi nhận thông tin cảnh báo nếu cần
            // (Nếu cần cảnh báo có thể throw exception hoặc return log flag)
        }
    }

    private function calculateGpsDistanceToPlot(FarmPlotModel $plot, ?float $lat, ?float $lon): array
    {
        if ($lat === null || $lon === null) {
            return ['distance' => null, 'verified' => true];
        }

        $boundary = $plot->boundary_coordinates;
        if (is_array($boundary) && count($boundary) >= 3) {
            // Tầng 1: Point-in-Polygon
            if ($this->isPointInPolygon($lat, $lon, $boundary)) {
                return ['distance' => 0.0, 'verified' => true];
            }

            // Tầng 2: Khoảng cách ngắn nhất tới cạnh mép thửa đất
            $minDist = $this->minDistanceToPolygonEdges($lat, $lon, $boundary);
            return [
                'distance' => round($minDist, 2),
                'verified' => $minDist <= 50.0 // Dung sai 50m
            ];
        }

        // Fallback: Tâm thửa đất nếu không có đa giác
        $cLat = $plot->gps_lat ?? ($plot->latitude ?? null);
        $cLon = $plot->gps_lng ?? ($plot->longitude ?? null);

        if ($cLat !== null && $cLon !== null) {
            $dist = $this->haversineDistanceMeters($lat, $lon, (float)$cLat, (float)$cLon);
            return [
                'distance' => round($dist, 2),
                'verified' => $dist <= 50.0
            ];
        }

        return ['distance' => null, 'verified' => true];
    }

    private function isPointInPolygon(float $lat, float $lon, array $polygon): bool
    {
        $inside = false;
        $n = count($polygon);
        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $xi = is_array($polygon[$i]) ? ($polygon[$i][0] ?? $polygon[$i]['lat']) : 0;
            $yi = is_array($polygon[$i]) ? ($polygon[$i][1] ?? $polygon[$i]['lng']) : 0;
            $xj = is_array($polygon[$j]) ? ($polygon[$j][0] ?? $polygon[$j]['lat']) : 0;
            $yj = is_array($polygon[$j]) ? ($polygon[$j][1] ?? $polygon[$j]['lng']) : 0;

            $intersect = (($yi > $lon) !== ($yj > $lon))
                && ($lat < ($xj - $xi) * ($lon - $yi) / ($yj - $yi + 1e-12) + $xi);
            if ($intersect) {
                $inside = !$inside;
            }
        }
        return $inside;
    }

    private function minDistanceToPolygonEdges(float $lat, float $lon, array $polygon): float
    {
        $minDist = PHP_FLOAT_MAX;
        $n = count($polygon);
        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $lat1 = is_array($polygon[$i]) ? ($polygon[$i][0] ?? $polygon[$i]['lat']) : 0;
            $lon1 = is_array($polygon[$i]) ? ($polygon[$i][1] ?? $polygon[$i]['lng']) : 0;
            $lat2 = is_array($polygon[$j]) ? ($polygon[$j][0] ?? $polygon[$j]['lat']) : 0;
            $lon2 = is_array($polygon[$j]) ? ($polygon[$j][1] ?? $polygon[$j]['lng']) : 0;

            $dist = $this->distanceToSegmentMeters($lat, $lon, $lat1, $lon1, $lat2, $lon2);
            if ($dist < $minDist) {
                $minDist = $dist;
            }
        }
        return $minDist;
    }

    private function distanceToSegmentMeters(float $lat, float $lon, float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        // Phép chiếu lên đoạn thẳng (flat earth approximation cho khoảng cách nhỏ)
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $r = 6371000; // Bán kính trái đất (mét)

        $x1 = 0;
        $y1 = 0;
        $x2 = $dLon * cos(deg2rad(($lat1 + $lat2) / 2)) * $r;
        $y2 = $dLat * $r;

        $pLat = deg2rad($lat - $lat1);
        $pLon = deg2rad($lon - $lon1);
        $px = $pLon * cos(deg2rad(($lat1 + $lat) / 2)) * $r;
        $py = $pLat * $r;

        $l2 = ($x2 - $x1) * ($x2 - $x1) + ($y2 - $y1) * ($y2 - $y1);
        if ($l2 === 0.0) {
            return sqrt($px * $px + $py * $py);
        }

        $t = max(0, min(1, ($px * $x2 + $py * $y2) / $l2));
        $projX = $t * $x2;
        $projY = $t * $y2;

        return sqrt(($px - $projX) * ($px - $projX) + ($py - $projY) * ($py - $projY));
    }

    private function haversineDistanceMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $r = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $r * $c;
    }

    private function recheckPlotQuarantineStatus(string $plotId): void
    {
        $hasActivePhi = PhiCalculationModel::whereHas('farmingLog', function ($q) use ($plotId) {
            $q->where('plot_id', $plotId);
        })
        ->where('status', 'ACTIVE')
        ->where('safety_date', '>=', now()->format('Y-m-d'))
        ->exists();

        if (!$hasActivePhi) {
            FarmPlotModel::where('id', $plotId)->update([
                'status' => 'ACTIVE',
                'quarantine_until' => null,
            ]);
        }
    }
}
