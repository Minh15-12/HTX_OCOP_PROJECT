<?php

namespace Modules\Inventory\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\DB;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueModel;

class MaterialReconciliationService
{
    public function __construct(
        private readonly TenantContext $tenantContext
    ) {}

    public function reconcileSeasonMaterials(string $cropSeasonId): array
    {
        $coopId = $this->tenantContext->getCooperativeId();

        $season = CropSeasonModel::with(['productionUnit.cooperative'])->where('id', $cropSeasonId)->first();
        if (!$season) {
            throw new DomainException('Mùa vụ canh tác không tồn tại', 'SEASON_NOT_FOUND', null, 404);
        }

        // 1. Get all approved stock issues linked to this season or member plots in this season
        $plotIds = DB::table('farm_plots')
            ->where('production_unit_id', $season->production_unit_id)
            ->pluck('id')
            ->toArray();

        $memberIds = DB::table('member_plot_assignments')
            ->whereIn('plot_id', $plotIds)
            ->pluck('member_id')
            ->unique()
            ->toArray();

        // Stock issues for these members during the season duration
        $startDate = $season->start_date ? $season->start_date->format('Y-m-d') : '2025-01-01';
        $endDate = $season->expected_end_date ? $season->expected_end_date->format('Y-m-d') : now()->toDateString();

        $issues = StockIssueModel::with(['lines.material', 'member'])
            ->where('cooperative_id', $coopId)
            ->where('status', 'APPROVED')
            ->where(function ($q) use ($season, $memberIds, $startDate, $endDate) {
                $q->where('purpose', 'LIKE', "%{$season->name}%")
                    ->orWhere(function ($sq) use ($memberIds, $startDate, $endDate) {
                        $sq->whereIn('member_id', $memberIds)
                            ->whereBetween('issue_date', [$startDate, $endDate]);
                    });
            })
            ->get();

        // 2. Aggregate issued quantities by material_id
        $issuedSummary = [];
        $expectedBottlesTotal = 0;
        $returnedBottlesTotal = 0;

        foreach ($issues as $issue) {
            $expectedBottlesTotal += (int) ($issue->empty_bottles_expected ?? 0);
            $returnedBottlesTotal += (int) ($issue->empty_bottles_returned ?? 0);

            foreach ($issue->lines as $line) {
                $matId = $line->material_id;
                if (!isset($issuedSummary[$matId])) {
                    $mat = $line->material;
                    $issuedSummary[$matId] = [
                        'material_id' => $matId,
                        'name' => $mat?->name ?? 'Vật tư',
                        'sku' => $mat?->sku ?? 'N/A',
                        'category' => $mat?->category ?? 'GENERAL',
                        'account_code' => $mat?->account_code ?: '1521',
                        'unit' => $mat?->unit ?? 'đơn vị',
                        'issued_qty' => 0.0,
                        'logged_qty' => 0.0,
                        'discrepancy' => 0.0,
                        'expected_bottles' => 0,
                        'returned_bottles' => 0,
                        'status' => 'BALANCED',
                    ];
                }
                $issuedSummary[$matId]['issued_qty'] += (float) $line->quantity;
                if ($line->material && $line->material->category === 'PESTICIDE') {
                    $issuedSummary[$matId]['expected_bottles'] += (int) ceil((float) $line->quantity);
                }
            }
        }

        // 3. Get all farming logs for this season
        $logs = FarmingLogModel::with(['material'])
            ->where('crop_season_id', $cropSeasonId)
            ->get();

        foreach ($logs as $log) {
            $matId = $log->material_id;
            if ($matId) {
                if (!isset($issuedSummary[$matId])) {
                    $mat = $log->material;
                    $issuedSummary[$matId] = [
                        'material_id' => $matId,
                        'name' => $mat?->name ?? ($log->biocontrol_agent_name ?: ($log->active_ingredient ?: 'Vật tư nhật ký')),
                        'sku' => $mat?->sku ?? 'N/A',
                        'category' => $mat?->category ?? 'GENERAL',
                        'account_code' => $mat?->account_code ?: '1521',
                        'unit' => $log->unit ?: ($mat?->unit ?? 'đơn vị'),
                        'issued_qty' => 0.0,
                        'logged_qty' => 0.0,
                        'discrepancy' => 0.0,
                        'expected_bottles' => 0,
                        'returned_bottles' => 0,
                        'status' => 'OVER_LOGGED',
                    ];
                }
                $issuedSummary[$matId]['logged_qty'] += (float) ($log->quantity_applied ?? 0);
            }
        }

        // 4. Calculate discrepancy and status for each material
        $reconciledItems = [];
        $totalIssuedAmount = 0.0;
        $balancedCount = 0;
        $alertCount = 0;

        foreach ($issuedSummary as $item) {
            $diff = $item['issued_qty'] - $item['logged_qty'];
            $item['discrepancy'] = round($diff, 4);

            if (abs($diff) <= 0.001) {
                $item['status'] = 'BALANCED'; // Cân bằng hoàn hảo
                $balancedCount++;
            } elseif ($diff > 0) {
                $item['status'] = 'UNDER_LOGGED'; // Còn tồn tại nhà màng hoặc quên ghi nhật ký
            } else {
                $item['status'] = 'OVER_LOGGED'; // Ghi vượt lượng xuất - Cảnh báo mua trôi nổi ngoài luồng!
                $alertCount++;
            }

            // Sync returned bottles
            if ($item['category'] === 'PESTICIDE') {
                $item['returned_bottles'] = min($item['expected_bottles'], $returnedBottlesTotal);
            }

            $reconciledItems[] = $item;
        }

        $bottleReturnRate = $expectedBottlesTotal > 0
            ? round(($returnedBottlesTotal / $expectedBottlesTotal) * 100, 1)
            : 100.0;

        return [
            'season' => [
                'id' => $season->id,
                'name' => $season->name,
                'crop' => $season->crop,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'puc_code' => $season->productionUnit?->unit_code ?? 'PUC-49-015-9923',
            ],
            'reconciliation_date' => now()->format('d/m/Y H:i'),
            'summary' => [
                'total_materials_tracked' => count($reconciledItems),
                'balanced_count' => $balancedCount,
                'alert_count' => $alertCount,
                'pesticide_bottles_expected' => $expectedBottlesTotal,
                'pesticide_bottles_returned' => $returnedBottlesTotal,
                'bottle_return_rate_percent' => $bottleReturnRate,
                'overall_audit_status' => ($alertCount === 0 && $bottleReturnRate >= 90.0) ? 'AUDIT_PASSED' : 'REQUIRES_REVIEW',
            ],
            'items' => $reconciledItems,
        ];
    }
}
