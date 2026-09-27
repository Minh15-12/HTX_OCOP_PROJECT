<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\CreateLotDTO;
use Modules\Agriculture\Domain\Entities\Lot;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\LotModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;

class LotService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly HarvestService $harvestService,
        private readonly AuditService $auditService
    ) {}

    public function listLots(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = LotModel::with(['harvest.cropSeason.productionUnit', 'harvest.plot']);

        if ($this->tenantContext->hasTenant()) {
            $tenantId = $this->tenantContext->getCooperativeId();
            $query->whereHas('harvest.cropSeason.productionUnit', function ($q) use ($tenantId) {
                $q->where('cooperative_id', $tenantId);
            });
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where('lot_code', $likeOp, $search);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['created_at', 'lot_code', 'quantity'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getLotById(string $id): LotModel
    {
        $lot = LotModel::with([
            'harvest.cropSeason.productionUnit.cooperative',
            'harvest.plot',
        ])->find($id);

        if (!$lot) {
            throw new DomainException('Lô sản phẩm không tồn tại trong hệ thống', 'LOT_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $lot->harvest->cropSeason->productionUnit->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập lô sản phẩm của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $lot;
    }

    public function getLotTraceability(string $id): array
    {
        $lot = $this->getLotById($id);
        $harvest = $lot->harvest;
        $season = $harvest->cropSeason;
        $unit = $season->productionUnit;
        $coop = $unit->cooperative;
        $plot = $harvest->plot;

        $logs = \Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel::with(['performer', 'material'])
            ->where('crop_season_id', $season->id)
            ->where('plot_id', $plot->id)
            ->where('activity_date', '<=', $harvest->harvest_date->format('Y-m-d'))
            ->orderBy('activity_date', 'desc')
            ->get();

        return [
            'lot' => [
                'id' => $lot->id,
                'lot_code' => $lot->lot_code,
                'quantity' => (float) $lot->quantity,
                'unit' => $lot->unit,
                'status' => $lot->status,
                'created_at' => $lot->created_at?->toIso8601String(),
            ],
            'harvest' => [
                'id' => $harvest->id,
                'harvest_date' => $harvest->harvest_date?->format('Y-m-d'),
                'quantity' => (float) $harvest->quantity,
                'unit' => $harvest->unit,
                'quality_information' => $harvest->quality_information,
                'kcs_status' => $harvest->kcs_status ?? 'PENDING_KCS',
                'kcs_gate_check' => $harvest->kcs_gate_check,
                'kcs_quick_lab' => $harvest->kcs_quick_lab,
                'grade' => $harvest->grade ?? 'GRADE_B',
                'brix_level' => $harvest->brix_level ? (float) $harvest->brix_level : null,
                'uniformity_rate' => $harvest->uniformity_rate ? (float) $harvest->uniformity_rate : null,
            ],
            'crop_season' => [
                'id' => $season->id,
                'name' => $season->name,
                'crop' => $season->crop,
                'start_date' => $season->start_date?->format('Y-m-d'),
                'expected_end_date' => $season->expected_end_date?->format('Y-m-d'),
            ],
            'farm_plot' => [
                'id' => $plot->id,
                'plot_code' => $plot->plot_code,
                'area' => (float) $plot->area,
            ],
            'production_unit' => [
                'id' => $unit->id,
                'unit_code' => $unit->unit_code,
                'name' => $unit->name,
                'crop' => $unit->crop,
                'area' => (float) $unit->area,
            ],
            'cooperative' => [
                'id' => $coop?->id,
                'cooperative_code' => $coop?->cooperative_code,
                'legal_name' => $coop?->legal_name,
            ],
            'tt02_traceability_logs' => $logs->map(fn($log) => [
                'id' => $log->id,
                'activity_type' => $log->activity_type,
                'activity_date' => $log->activity_date?->format('Y-m-d'),
                'plot_code' => $plot->plot_code,
                'season_code' => $season->name,
                'material_name' => $log->material?->name,
                'material_batch_number' => $log->material_batch_number,
                'quantity_applied' => $log->quantity_applied ? (float) $log->quantity_applied : null,
                'unit' => $log->unit,
                'phi_days' => $log->phi_days,
                'gps_latitude' => $log->gps_latitude ? (float) $log->gps_latitude : null,
                'gps_longitude' => $log->gps_longitude ? (float) $log->gps_longitude : null,
                'attachment_reference' => $log->attachment_reference,
                'performer_name' => $log->performer?->full_name,
                'recorded_at' => $log->created_at?->toIso8601String(),
            ]),
        ];
    }

    public function createLot(CreateLotDTO $dto): LotModel
    {
        $harvest = $this->harvestService->getHarvestById($dto->harvestId);

        $quantity = $dto->quantity ?: (float) $harvest->quantity;
        $unit = $dto->unit ?: $harvest->unit;

        // Generate lot_code according to GS1 Standard: LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]
        $coopCode = $harvest->cropSeason->productionUnit->cooperative->cooperative_code ?? 'TT';
        $plotCode = $harvest->plot->plot_code ?? 'P001';
        $dateStr = now()->format('Ymd');
        $seq = str_pad((string) (LotModel::whereDate('created_at', now()->toDateString())->count() + 1), 2, '0', STR_PAD_LEFT);
        $lotCode = $dto->customLotCode ?: strtoupper("LOT-{$coopCode}-{$plotCode}-{$dateStr}-{$seq}");

        // Uniqueness check
        $exists = LotModel::where('lot_code', $lotCode)->exists();
        if ($exists) {
            $lotCode = strtoupper("LOT-{$coopCode}-{$plotCode}-{$dateStr}-" . Str::random(4));
        }

        $domainEntity = new Lot(
            id: (string) Str::uuid(),
            lotCode: $lotCode,
            harvestId: $harvest->id,
            quantity: $quantity,
            unit: $unit,
            status: 'CREATED',
            sourceInformation: $dto->sourceInformation
        );

        $lot = LotModel::create([
            'id' => $domainEntity->id,
            'lot_code' => $domainEntity->lotCode,
            'harvest_id' => $domainEntity->harvestId,
            'quantity' => $domainEntity->quantity,
            'unit' => $domainEntity->unit,
            'status' => $domainEntity->status,
            'source_information' => $domainEntity->sourceInformation,
        ]);

        // Link harvest to lot
        $harvest->update(['lot_id' => $lot->id]);

        $this->auditService->log(
            action: 'LOT_CREATED',
            entityType: 'Lot',
            entityId: $lot->id,
            after: $lot->toArray(),
            cooperativeId: $harvest->cropSeason->productionUnit->cooperative_id
        );

        return $lot->load(['harvest.cropSeason.productionUnit', 'harvest.plot']);
    }
}
