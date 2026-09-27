<?php

namespace Modules\Report\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\DB;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;

class DashboardReportService
{
    public function getDashboardSummary(?string $cooperativeId = null): array
    {
        // Default to active cooperative if omitted
        $user = auth()->user();
        $coopId = $cooperativeId ?: ($user ? $user->cooperative_id : null);

        // Members stats
        $membersQuery = DB::table('members');
        $capitalQuery = DB::table('capital_contributions');
        $productsQuery = DB::table('products');
        $applicationsQuery = DB::table('ocop_applications');

        if ($coopId) {
            $membersQuery->where('cooperative_id', $coopId);
            $capitalQuery->whereIn('member_id', function ($q) use ($coopId) {
                $q->select('id')->from('members')->where('cooperative_id', $coopId);
            });
            $productsQuery->where('cooperative_id', $coopId);
            $applicationsQuery->where('cooperative_id', $coopId);
        }

        $totalMembers = $membersQuery->count();
        $totalCapital = (float) $capitalQuery->whereIn('status', ['COMPLETED', 'PAID'])->sum('amount');
        $totalProducts = $productsQuery->count();
        $totalApplications = $applicationsQuery->count();

        // Application status breakdown
        $applicationStatuses = $applicationsQuery
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Production units and farm plots area
        $plotsQuery = DB::table('farm_plots');
        if ($coopId) {
            $plotsQuery->join('production_units', 'farm_plots.production_unit_id', '=', 'production_units.id')
                ->where('production_units.cooperative_id', $coopId);
        }
        $totalPlotAreaHa = (float) $plotsQuery->sum('farm_plots.area');
        $totalPlots = $plotsQuery->count();

        // Active crop seasons count
        $activeSeasons = CropSeasonModel::where('status', 'ACTIVE')->count();
        $totalHarvests = HarvestModel::count();

        return [
            'cooperative_id' => $coopId,
            'members' => [
                'total_members' => $totalMembers,
                'total_capital_contribution' => $totalCapital,
            ],
            'agriculture' => [
                'total_plots' => $totalPlots,
                'total_area_ha' => round($totalPlotAreaHa, 2),
                'active_crop_seasons' => $activeSeasons,
                'total_harvests' => $totalHarvests,
            ],
            'products' => [
                'total_products' => $totalProducts,
            ],
            'ocop_applications' => [
                'total_applications' => $totalApplications,
                'status_breakdown' => $applicationStatuses,
            ],
            'generated_at' => now()->toIso8601String(),
        ];
    }

    public function getOcopReadiness(string $applicationId): array
    {
        $app = DB::table('ocop_applications')->where('id', $applicationId)->first();
        if (!$app) {
            throw new DomainException(
                "Không tìm thấy hồ sơ OCOP với ID: {$applicationId}",
                'APPLICATION_NOT_FOUND',
                null,
                404
            );
        }

        // Get total indicators count in criteria version
        $totalIndicators = DB::table('indicators')
            ->join('criteria', 'indicators.criterion_id', '=', 'criteria.id')
            ->join('criteria_groups', 'criteria.criteria_group_id', '=', 'criteria_groups.id')
            ->where('criteria_groups.criteria_version_id', $app->criteria_version_id)
            ->count();

        // Get self assessed count
        $selfAssessedCount = DB::table('self_assessments')
            ->where('application_id', $applicationId)
            ->count();

        // Get evidence linked indicators count
        $evidenceLinkedCount = DB::table('evidence_links')
            ->join('evidences', 'evidence_links.evidence_id', '=', 'evidences.id')
            ->where('evidences.application_id', $applicationId)
            ->distinct('evidence_links.indicator_id')
            ->count('evidence_links.indicator_id');

        $selfAssessmentPercent = $totalIndicators > 0
            ? round(($selfAssessedCount / $totalIndicators) * 100, 2)
            : 0.0;

        $evidencePercent = $totalIndicators > 0
            ? round(($evidenceLinkedCount / $totalIndicators) * 100, 2)
            : 0.0;

        $overallReadinessScore = round(($selfAssessmentPercent * 0.5) + ($evidencePercent * 0.5), 2);
        $isReadyForSubmission = ($selfAssessmentPercent >= 80.0 && $evidencePercent >= 50.0);

        return [
            'application_id' => $applicationId,
            'application_number' => $app->application_number ?? null,
            'status' => $app->status,
            'metrics' => [
                'total_indicators' => $totalIndicators,
                'self_assessed_indicators' => $selfAssessedCount,
                'evidence_linked_indicators' => $evidenceLinkedCount,
                'self_assessment_completion_rate' => $selfAssessmentPercent,
                'evidence_linkage_completion_rate' => $evidencePercent,
                'overall_readiness_score' => $overallReadinessScore,
            ],
            'checklist' => [
                'dossier_info_completed' => true,
                'self_assessment_min_threshold_met' => ($selfAssessmentPercent >= 80.0),
                'evidence_attached_min_threshold_met' => ($evidencePercent >= 50.0),
                'is_ready_for_submission' => $isReadyForSubmission,
            ],
            'generated_at' => now()->toIso8601String(),
        ];
    }
}
