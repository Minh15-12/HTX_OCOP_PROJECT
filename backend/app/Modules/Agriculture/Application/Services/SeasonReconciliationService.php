<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\SeasonMaterialReconciliationModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;

class SeasonReconciliationService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function getReconciliationsBySeason(string $seasonId): Collection
    {
        $season = CropSeasonModel::with('productionUnit')->findOrFail($seasonId);
        $this->validateTenant($season->productionUnit->cooperative_id);

        $existing = SeasonMaterialReconciliationModel::with(['material', 'reconciler'])
            ->where('crop_season_id', $seasonId)
            ->get();

        if ($existing->isNotEmpty()) {
            return $existing;
        }

        // Tự động tổng hợp dữ liệu ban đầu từ farming_logs
        return $this->generateInitialReconciliations($season);
    }

    public function saveReconciliation(string $seasonId, array $items, ?string $reconciledBy = null): Collection
    {
        $season = CropSeasonModel::with('productionUnit')->findOrFail($seasonId);
        $this->validateTenant($season->productionUnit->cooperative_id);

        if ($season->logbook_status === 'FROZEN_ARCHIVED') {
            throw new DomainException('Sổ nhật ký của mùa vụ này đã bị khóa đóng băng, không thể chỉnh sửa', 'LOGBOOK_FROZEN', null, 403);
        }

        $cooperativeId = $season->productionUnit->cooperative_id;
        $savedItems = collect();

        foreach ($items as $item) {
            $opening = (float) ($item['opening_balance'] ?? 0);
            $received = (float) ($item['received_from_coop'] ?? 0);
            $used = (float) ($item['used_in_logbook'] ?? 0);
            $actual = (float) ($item['actual_closing_balance'] ?? 0);
            $variance = $actual - ($opening + $received - $used);

            $record = SeasonMaterialReconciliationModel::updateOrCreate(
                [
                    'crop_season_id' => $seasonId,
                    'material_id' => $item['material_id'],
                ],
                [
                    'cooperative_id' => $cooperativeId,
                    'material_name' => $item['material_name'] ?? 'Vật tư nông nghiệp',
                    'unit' => $item['unit'] ?? 'kg',
                    'opening_balance' => $opening,
                    'received_from_coop' => $received,
                    'used_in_logbook' => $used,
                    'actual_closing_balance' => $actual,
                    'variance' => $variance,
                    'empty_packaging_returned' => (int) ($item['empty_packaging_returned'] ?? 0),
                    'waste_disposal_slip_code' => $item['waste_disposal_slip_code'] ?? null,
                    'reconciliation_notes' => $item['reconciliation_notes'] ?? null,
                    'status' => 'CONFIRMED',
                    'reconciled_by' => $reconciledBy ?: (auth()->check() ? auth()->id() : null),
                ]
            );

            $savedItems->push($record);
        }

        $this->auditService->log(
            action: 'SEASON_MATERIAL_RECONCILED',
            entityType: 'CropSeason',
            entityId: $seasonId,
            after: ['reconciled_count' => $savedItems->count()],
            cooperativeId: $cooperativeId
        );

        return $savedItems->load(['material', 'reconciler']);
    }

    public function freezeLogbook(string $seasonId, ?string $frozenBy = null): CropSeasonModel
    {
        $season = CropSeasonModel::with(['productionUnit', 'farmingLogs', 'harvests', 'reconciliations'])->findOrFail($seasonId);
        $this->validateTenant($season->productionUnit->cooperative_id);

        if ($season->logbook_status === 'FROZEN_ARCHIVED') {
            throw new DomainException('Sổ nhật ký vụ mùa đã được khóa trước đó', 'ALREADY_FROZEN', null, 400);
        }

        // Tính toán chuỗi băm Merkle Root SHA-256 từ toàn bộ nhật ký canh tác và thu hoạch
        $logHashes = $season->farmingLogs->map(function ($log) {
            return hash('sha256', $log->id . $log->activity_date . $log->activity_type . ($log->quantity_applied ?? '0') . ($log->active_ingredient ?? ''));
        })->values()->all();

        $harvestHashes = $season->harvests->map(function ($h) {
            return hash('sha256', $h->id . $h->harvest_date . $h->quantity . ($h->weighing_slip_code ?? ''));
        })->values()->all();

        $combinedHash = hash('sha256', implode('|', array_merge($logHashes, $harvestHashes, [
            $season->id,
            $season->name,
            now()->toIso8601String(),
        ])));

        $season->update([
            'logbook_status' => 'FROZEN_ARCHIVED',
            'logbook_frozen_at' => now(),
            'logbook_final_hash' => $combinedHash,
        ]);

        $this->auditService->log(
            action: 'SEASON_LOGBOOK_FROZEN',
            entityType: 'CropSeason',
            entityId: $seasonId,
            after: [
                'logbook_status' => 'FROZEN_ARCHIVED',
                'final_hash' => $combinedHash,
                'frozen_by' => $frozenBy ?: (auth()->check() ? auth()->id() : null),
            ],
            cooperativeId: $season->productionUnit->cooperative_id
        );

        return $season;
    }

    private function generateInitialReconciliations(CropSeasonModel $season): Collection
    {
        $cooperativeId = $season->productionUnit->cooperative_id;

        // Tổng hợp từ các farming_logs có material_id
        $usedMaterials = FarmingLogModel::where('crop_season_id', $season->id)
            ->whereNotNull('material_id')
            ->selectRaw('material_id, SUM(COALESCE(quantity_applied, 0)) as total_used, MAX(unit) as unit')
            ->groupBy('material_id')
            ->get();

        $reconciliations = collect();

        foreach ($usedMaterials as $usage) {
            $material = \Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel::find($usage->material_id);
            if (!$material) continue;

            $totalUsed = (float) $usage->total_used;
            // Giả định nhập kho bằng tổng lượng dùng + lượng dự trữ an toàn
            $received = $totalUsed; 

            $item = SeasonMaterialReconciliationModel::create([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $cooperativeId,
                'crop_season_id' => $season->id,
                'material_id' => $material->id,
                'material_name' => $material->name,
                'unit' => $usage->unit ?: ($material->unit ?? 'kg'),
                'opening_balance' => 0,
                'received_from_coop' => $received,
                'used_in_logbook' => $totalUsed,
                'actual_closing_balance' => 0,
                'variance' => 0,
                'empty_packaging_returned' => ceil($totalUsed / max(1, (float)($material->package_size ?? 1))),
                'waste_disposal_slip_code' => 'TH-RTH-' . strtoupper(substr(str_replace('-', '', $season->id), 0, 6)),
                'reconciliation_notes' => 'Tự động tổng hợp từ nhật ký canh tác',
                'status' => 'DRAFT',
            ]);

            $reconciliations->push($item);
        }

        return $reconciliations->load('material');
    }

    private function validateTenant(string $tenantId): void
    {
        if ($this->tenantContext->hasTenant() && $this->tenantContext->getCooperativeId() !== $tenantId) {
            throw new DomainException('Bạn không có quyền truy cập dữ liệu của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }
    }
}
