<?php

use App\Shared\Presentation\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;
use Modules\Agriculture\Presentation\Http\Controllers\CropSeasonController;
use Modules\Agriculture\Presentation\Http\Controllers\FarmingLogController;
use Modules\Agriculture\Presentation\Http\Controllers\FarmPlotController;
use Modules\Agriculture\Presentation\Http\Controllers\HarvestController;
use Modules\Agriculture\Presentation\Http\Controllers\LotController;
use Modules\Agriculture\Presentation\Http\Controllers\MaterialUsageController;
use Modules\Agriculture\Presentation\Http\Controllers\PhiCalculationController;
use Modules\Agriculture\Presentation\Http\Controllers\ProductionUnitController;
use Modules\Agriculture\Presentation\Http\Controllers\PublicTraceabilityController;
use Modules\Cooperative\Presentation\Http\Controllers\CapitalContributionController;
use Modules\Cooperative\Presentation\Http\Controllers\CooperativeController;
use Modules\Cooperative\Presentation\Http\Controllers\MemberController;
use Modules\Finance\Presentation\Http\Controllers\CashTransactionController;
use Modules\Finance\Presentation\Http\Controllers\ReceivablePayableController;
use Modules\Finance\Presentation\Http\Controllers\SurplusDistributionController;
use Modules\Identity\Presentation\Http\Controllers\AuthController;
use Modules\Identity\Presentation\Http\Controllers\PermissionController;
use Modules\Identity\Presentation\Http\Controllers\RoleController;
use Modules\Identity\Presentation\Http\Controllers\SystemSettingController;
use Modules\Identity\Presentation\Http\Controllers\UserController;
use Modules\Inventory\Presentation\Http\Controllers\MaterialController;
use Modules\Inventory\Presentation\Http\Controllers\StockCountController;
use Modules\Inventory\Presentation\Http\Controllers\StockIssueController;
use Modules\Inventory\Presentation\Http\Controllers\StockReceiptController;
use Modules\Ocop\Criteria\Presentation\Http\Controllers\CouncilLevelController;
use Modules\Ocop\Criteria\Presentation\Http\Controllers\CriteriaGroupController;
use Modules\Ocop\Criteria\Presentation\Http\Controllers\CriteriaVersionController;
use Modules\Ocop\Criteria\Presentation\Http\Controllers\CriterionController;
use Modules\Ocop\Criteria\Presentation\Http\Controllers\IndicatorController;
use Modules\Ocop\Dossier\Presentation\Http\Controllers\OcopApplicationController;
use Modules\Ocop\Dossier\Presentation\Http\Controllers\SelfAssessmentController;
use Modules\Ocop\Evidence\Presentation\Http\Controllers\EvidenceController;
use Modules\Ocop\Evidence\Presentation\Http\Controllers\EvidenceLinkController;
use Modules\Ocop\Evidence\Presentation\Http\Controllers\EvidenceVersionController;
use Modules\Audit\Presentation\Http\Controllers\AuditLogController;
use Modules\Ocop\Evaluation\Presentation\Http\Controllers\ConsolidatedResultController;
use Modules\Ocop\Evaluation\Presentation\Http\Controllers\EvaluationSessionController;
use Modules\Ocop\Evaluation\Presentation\Http\Controllers\EvaluatorScoreController;
use Modules\Ocop\Evaluation\Presentation\Http\Controllers\FinalDecisionController;
use Modules\Product\Presentation\Http\Controllers\ProductController;
use Modules\Report\Presentation\Http\Controllers\DocumentController;
use Modules\Report\Presentation\Http\Controllers\ReportController;
use Modules\Notification\Presentation\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
*/

// Health Check Endpoint (Public)
Route::get('/health', [HealthController::class, 'check'])->name('api.health');

// Public Traceability Routes (Public, outside auth:sanctum)
Route::get('/public/trace/{lotId}', [PublicTraceabilityController::class, 'show'])->name('api.public.trace');
Route::get('/trace/{lotId}', [PublicTraceabilityController::class, 'show'])->name('api.trace');

// Authentication Routes (Public / Protected)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('api.auth.login');

    Route::middleware(['auth:sanctum', 'tenant.scope'])->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('api.auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
    });
});

// Protected Business Routes
Route::middleware(['auth:sanctum', 'tenant.scope'])->group(function () {
    // Identity & User Management
    Route::get('/users', [UserController::class, 'index'])->name('api.users.index');
    Route::post('/users', [UserController::class, 'store'])->name('api.users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('api.users.update');
    Route::patch('/users/{id}/status', [UserController::class, 'toggleStatus'])->name('api.users.status');

    // Role & Permission Management APIs
    Route::get('/roles', [RoleController::class, 'index'])->name('api.roles.index');
    Route::post('/roles', [RoleController::class, 'store'])->name('api.roles.store');
    Route::get('/roles/{id}', [RoleController::class, 'show'])->name('api.roles.show');
    Route::put('/roles/{id}', [RoleController::class, 'update'])->name('api.roles.update');
    Route::put('/roles/{id}/permissions', [RoleController::class, 'updatePermissions'])->name('api.roles.permissions.update');

    Route::get('/permissions', [PermissionController::class, 'index'])->name('api.permissions.index');

    // System Settings & Security APIs
    Route::get('/system-settings', [SystemSettingController::class, 'show'])->name('api.system-settings.show');
    Route::put('/system-settings', [SystemSettingController::class, 'update'])->name('api.system-settings.update');

    // Cooperative Master Data Management
    Route::get('/cooperatives/my-cooperative', [CooperativeController::class, 'showMyCooperative'])->name('api.cooperative.show');
    Route::put('/cooperatives/my-cooperative', [CooperativeController::class, 'updateMyCooperative'])->name('api.cooperative.update');

    // Member Management Module Routes (Section 10 of 12_API_SPECIFICATION.md)
    Route::get('/members', [MemberController::class, 'index'])->name('api.members.index');
    Route::post('/members', [MemberController::class, 'store'])->name('api.members.store');
    Route::get('/members/{id}', [MemberController::class, 'show'])->name('api.members.show');
    Route::patch('/members/{id}', [MemberController::class, 'update'])->name('api.members.update');
    Route::delete('/members/{id}', [MemberController::class, 'destroy'])->name('api.members.destroy');
    Route::post('/members/{id}/approve', [MemberController::class, 'approve'])->name('api.members.approve');
    Route::post('/members/{id}/status-transitions', [MemberController::class, 'transitionStatus'])->name('api.members.status-transition');

    // Capital Contribution Routes (Section 11 of 12_API_SPECIFICATION.md)
    Route::get('/capital-contributions/summary', [CapitalContributionController::class, 'summary'])->name('api.contributions.summary');
    Route::get('/capital-contributions', [CapitalContributionController::class, 'indexAll'])->name('api.contributions.index-all');
    Route::get('/members/{member_id}/capital-contributions', [CapitalContributionController::class, 'index'])->name('api.members.contributions.index');
    Route::post('/members/{member_id}/capital-contributions', [CapitalContributionController::class, 'store'])->name('api.members.contributions.store');
    Route::get('/capital-contributions/{id}', [CapitalContributionController::class, 'show'])->name('api.contributions.show');

    // Production Unit APIs (Section 13 of 12_API_SPECIFICATION.md)
    Route::get('/production-units', [ProductionUnitController::class, 'index'])->name('api.production-units.index');
    Route::post('/production-units', [ProductionUnitController::class, 'store'])->name('api.production-units.store');
    Route::get('/production-units/{id}', [ProductionUnitController::class, 'show'])->name('api.production-units.show');
    Route::patch('/production-units/{id}', [ProductionUnitController::class, 'update'])->name('api.production-units.update');

    // Farm Plot APIs (Section 14 of 12_API_SPECIFICATION.md)
    Route::get('/production-units/{unit_id}/plots', [FarmPlotController::class, 'indexByUnit'])->name('api.production-units.plots.index');
    Route::post('/production-units/{unit_id}/plots', [FarmPlotController::class, 'storeInUnit'])->name('api.production-units.plots.store');
    Route::get('/farm-plots/{plot_id}', [FarmPlotController::class, 'show'])->name('api.farm-plots.show');
    Route::get('/farm-plots/{plot_id}/member-assignments', [FarmPlotController::class, 'listAssignments'])->name('api.farm-plots.assignments.index');
    Route::post('/farm-plots/{plot_id}/member-assignments', [FarmPlotController::class, 'assignMember'])->name('api.farm-plots.assignments.store');

    // Crop Season APIs (Section 15 of 12_API_SPECIFICATION.md)
    Route::get('/crop-seasons', [CropSeasonController::class, 'index'])->name('api.crop-seasons.index');
    Route::post('/crop-seasons', [CropSeasonController::class, 'store'])->name('api.crop-seasons.store');
    Route::get('/crop-seasons/{id}', [CropSeasonController::class, 'show'])->name('api.crop-seasons.show');
    Route::patch('/crop-seasons/{id}', [CropSeasonController::class, 'update'])->name('api.crop-seasons.update');
    Route::post('/crop-seasons/{id}/close', [CropSeasonController::class, 'close'])->name('api.crop-seasons.close');

    // Farming Log APIs (Section 16 of 12_API_SPECIFICATION.md)
    Route::get('/farming-logs', [FarmingLogController::class, 'index'])->name('api.farming-logs.index');
    Route::post('/farming-logs', [FarmingLogController::class, 'store'])->name('api.farming-logs.store');
    Route::get('/farming-logs/{id}', [FarmingLogController::class, 'show'])->name('api.farming-logs.show');
    Route::patch('/farming-logs/{id}', [FarmingLogController::class, 'update'])->name('api.farming-logs.update');

    // Material Usage APIs (Section 17 of 12_API_SPECIFICATION.md)
    Route::get('/farming-logs/{log_id}/material-usages', [MaterialUsageController::class, 'indexByLog'])->name('api.farming-logs.usages.index');
    Route::post('/farming-logs/{log_id}/material-usages', [MaterialUsageController::class, 'storeInLog'])->name('api.farming-logs.usages.store');
    Route::delete('/material-usages/{id}', [MaterialUsageController::class, 'destroy'])->name('api.material-usages.destroy');

    // PHI Calculation APIs (Section 18 of 12_API_SPECIFICATION.md)
    Route::get('/farming-logs/{log_id}/phi-calculations', [PhiCalculationController::class, 'indexByLog'])->name('api.farming-logs.phi.index');
    Route::post('/farming-logs/{log_id}/phi-calculations', [PhiCalculationController::class, 'calculate'])->name('api.farming-logs.phi.calculate');
    Route::get('/phi-calculations/{id}', [PhiCalculationController::class, 'show'])->name('api.phi-calculations.show');

    // Harvest & Lot APIs (Section 19 of 12_API_SPECIFICATION.md)
    Route::get('/harvests', [HarvestController::class, 'index'])->name('api.harvests.index');
    Route::post('/harvests', [HarvestController::class, 'store'])->name('api.harvests.store');
    Route::get('/harvests/{id}', [HarvestController::class, 'show'])->name('api.harvests.show');
    Route::patch('/harvests/{id}', [HarvestController::class, 'update'])->name('api.harvests.update');
    Route::post('/harvests/{id}/kcs/gate-check', [HarvestController::class, 'gateCheck'])->name('api.harvests.gate-check');
    Route::post('/harvests/{id}/kcs/quick-lab', [HarvestController::class, 'quickLab'])->name('api.harvests.quick-lab');
    Route::post('/harvests/{id}/kcs/grading', [HarvestController::class, 'grading'])->name('api.harvests.grading');
    Route::post('/harvests/settle-season', [HarvestController::class, 'settleSeason'])->name('api.harvests.settle-season');

    Route::get('/lots', [LotController::class, 'index'])->name('api.lots.index');
    Route::post('/lots', [LotController::class, 'store'])->name('api.lots.store');
    Route::get('/lots/{id}', [LotController::class, 'show'])->name('api.lots.show');
    Route::get('/lots/{id}/traceability', [LotController::class, 'traceability'])->name('api.lots.traceability');

    // Product APIs (Section 20 of 12_API_SPECIFICATION.md)
    Route::get('/products', [ProductController::class, 'index'])->name('api.products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('api.products.store');
    Route::get('/products/{id}', [ProductController::class, 'show'])->name('api.products.show');
    Route::patch('/products/{id}', [ProductController::class, 'update'])->name('api.products.update');
    Route::get('/products/{product_id}/lots', [ProductController::class, 'listLots'])->name('api.products.lots.index');
    Route::post('/products/{product_id}/lots', [ProductController::class, 'attachLot'])->name('api.products.lots.attach');

    // Material Master Data APIs (Section 21 of 12_API_SPECIFICATION.md)
    Route::get('/materials', [MaterialController::class, 'index'])->name('api.materials.index');
    Route::post('/materials', [MaterialController::class, 'store'])->name('api.materials.store');
    Route::get('/materials/{id}', [MaterialController::class, 'show'])->name('api.materials.show');
    Route::patch('/materials/{id}', [MaterialController::class, 'update'])->name('api.materials.update');

    // Stock Receipt APIs (Section 22 of 12_API_SPECIFICATION.md)
    Route::get('/stock-receipts', [StockReceiptController::class, 'index'])->name('api.stock-receipts.index');
    Route::post('/stock-receipts', [StockReceiptController::class, 'store'])->name('api.stock-receipts.store');
    Route::get('/stock-receipts/{id}', [StockReceiptController::class, 'show'])->name('api.stock-receipts.show');
    Route::post('/stock-receipts/{id}/submit', [StockReceiptController::class, 'submit'])->name('api.stock-receipts.submit');
    Route::post('/stock-receipts/{id}/approve', [StockReceiptController::class, 'approve'])->name('api.stock-receipts.approve');

    // Stock Issue APIs (Section 23 of 12_API_SPECIFICATION.md)
    Route::get('/stock-issues', [StockIssueController::class, 'index'])->name('api.stock-issues.index');
    Route::post('/stock-issues', [StockIssueController::class, 'store'])->name('api.stock-issues.store');
    Route::get('/stock-issues/{id}', [StockIssueController::class, 'show'])->name('api.stock-issues.show');
    Route::post('/stock-issues/{id}/submit', [StockIssueController::class, 'submit'])->name('api.stock-issues.submit');
    Route::post('/stock-issues/{id}/approve', [StockIssueController::class, 'approve'])->name('api.stock-issues.approve');

    // Stock Count APIs (Section 24 of 12_API_SPECIFICATION.md)
    Route::get('/stock-counts', [StockCountController::class, 'index'])->name('api.stock-counts.index');
    Route::post('/stock-counts', [StockCountController::class, 'store'])->name('api.stock-counts.store');
    Route::get('/stock-counts/{id}', [StockCountController::class, 'show'])->name('api.stock-counts.show');
    Route::post('/stock-counts/{id}/complete', [StockCountController::class, 'complete'])->name('api.stock-counts.complete');
    Route::post('/stock-counts/{id}/approve', [StockCountController::class, 'approve'])->name('api.stock-counts.approve');

    // Cash Transaction APIs (Section 25 of 12_API_SPECIFICATION.md)
    Route::get('/cash-transactions', [CashTransactionController::class, 'index'])->name('api.cash-transactions.index');
    Route::post('/cash-transactions', [CashTransactionController::class, 'store'])->name('api.cash-transactions.store');
    Route::get('/cash-transactions/{id}', [CashTransactionController::class, 'show'])->name('api.cash-transactions.show');
    Route::post('/cash-transactions/{id}/approve', [CashTransactionController::class, 'approve'])->name('api.cash-transactions.approve');
    Route::post('/cash-transactions/{id}/post', [CashTransactionController::class, 'post'])->name('api.cash-transactions.post');

    // Receivable / Payable APIs (Section 26 of 12_API_SPECIFICATION.md)
    Route::get('/receivable-payables', [ReceivablePayableController::class, 'index'])->name('api.receivable-payables.index');
    Route::post('/receivable-payables', [ReceivablePayableController::class, 'store'])->name('api.receivable-payables.store');
    Route::get('/receivable-payables/{id}', [ReceivablePayableController::class, 'show'])->name('api.receivable-payables.show');
    Route::patch('/receivable-payables/{id}', [ReceivablePayableController::class, 'update'])->name('api.receivable-payables.update');

    // Debt Settlement APIs (Section 27 of 12_API_SPECIFICATION.md)
    Route::get('/receivable-payables/{debt_id}/settlements', [ReceivablePayableController::class, 'listSettlements'])->name('api.receivable-payables.settlements.index');
    Route::post('/receivable-payables/{debt_id}/settlements', [ReceivablePayableController::class, 'createSettlement'])->name('api.receivable-payables.settlements.store');
    Route::post('/receivable-payables/harvest-settlements', [ReceivablePayableController::class, 'processHarvestSettlement'])->name('api.receivable-payables.harvest-settlement');

    // Surplus Distribution Plan APIs (Section 28 of 12_API_SPECIFICATION.md)
    Route::get('/surplus-distribution-plans', [SurplusDistributionController::class, 'index'])->name('api.surplus.plans.index');
    Route::post('/surplus-distribution-plans', [SurplusDistributionController::class, 'store'])->name('api.surplus.plans.store');
    Route::get('/surplus-distribution-plans/{id}', [SurplusDistributionController::class, 'show'])->name('api.surplus.plans.show');
    Route::post('/surplus-distribution-plans/{id}/submit', [SurplusDistributionController::class, 'submit'])->name('api.surplus.plans.submit');
    Route::post('/surplus-distribution-plans/{id}/approve', [SurplusDistributionController::class, 'approve'])->name('api.surplus.plans.approve');

    // OCOP Criteria Engine APIs (Section 29 of 12_API_SPECIFICATION.md)
    Route::get('/ocop/council-levels', [CouncilLevelController::class, 'index'])->name('api.ocop.council-levels.index');
    Route::get('/ocop/criteria-versions', [CriteriaVersionController::class, 'index'])->name('api.ocop.criteria-versions.index');
    Route::post('/ocop/criteria-versions', [CriteriaVersionController::class, 'store'])->name('api.ocop.criteria-versions.store');
    Route::get('/ocop/criteria-versions/{id}', [CriteriaVersionController::class, 'show'])->name('api.ocop.criteria-versions.show');
    Route::patch('/ocop/criteria-versions/{id}', [CriteriaVersionController::class, 'update'])->name('api.ocop.criteria-versions.update');
    Route::post('/ocop/criteria-versions/{id}/publish', [CriteriaVersionController::class, 'publish'])->name('api.ocop.criteria-versions.publish');
    Route::get('/ocop/criteria-versions/{versionId}/groups', [CriteriaGroupController::class, 'indexByVersion'])->name('api.ocop.criteria-versions.groups.index');
    Route::post('/ocop/criteria-versions/{versionId}/groups', [CriteriaGroupController::class, 'storeInVersion'])->name('api.ocop.criteria-versions.groups.store');
    Route::get('/ocop/criteria-groups/{groupId}/criteria', [CriterionController::class, 'indexByGroup'])->name('api.ocop.criteria-groups.criteria.index');
    Route::post('/ocop/criteria-groups/{groupId}/criteria', [CriterionController::class, 'storeInGroup'])->name('api.ocop.criteria-groups.criteria.store');
    Route::get('/ocop/criteria/{criterionId}/indicators', [IndicatorController::class, 'indexByCriterion'])->name('api.ocop.criteria.indicators.index');
    Route::post('/ocop/criteria/{criterionId}/indicators', [IndicatorController::class, 'storeInCriterion'])->name('api.ocop.criteria.indicators.store');
    Route::patch('/ocop/indicators/{id}', [IndicatorController::class, 'update'])->name('api.ocop.indicators.update');

    // OCOP Application & Self-Assessment APIs (Section 30 of 12_API_SPECIFICATION.md)
    Route::get('/ocop/applications', [OcopApplicationController::class, 'index'])->name('api.ocop.applications.index');
    Route::post('/ocop/applications', [OcopApplicationController::class, 'store'])->name('api.ocop.applications.store');
    Route::get('/ocop/applications/{id}', [OcopApplicationController::class, 'show'])->name('api.ocop.applications.show');
    Route::patch('/ocop/applications/{id}', [OcopApplicationController::class, 'update'])->name('api.ocop.applications.update');
    Route::get('/ocop/applications/{id}/score-suggestions', [OcopApplicationController::class, 'scoreSuggestions'])->name('api.ocop.applications.score-suggestions');
    Route::get('/ocop/applications/{id}/self-assessments', [SelfAssessmentController::class, 'index'])->name('api.ocop.applications.self-assessments.index');
    Route::post('/ocop/applications/{id}/self-assessments', [SelfAssessmentController::class, 'store'])->name('api.ocop.applications.self-assessments.store');
    Route::post('/ocop/applications/{id}/ready-for-submission', [OcopApplicationController::class, 'readyForSubmission'])->name('api.ocop.applications.ready-for-submission');
    Route::post('/ocop/applications/{id}/submit', [OcopApplicationController::class, 'submit'])->name('api.ocop.applications.submit');

    // OCOP Evidence Management APIs (Section 31 of 12_API_SPECIFICATION.md)
    Route::get('/ocop/applications/{applicationId}/evidences', [EvidenceController::class, 'indexByApplication'])->name('api.ocop.applications.evidences.index');
    Route::post('/ocop/applications/{applicationId}/evidences', [EvidenceController::class, 'storeInApplication'])->name('api.ocop.applications.evidences.store');
    Route::post('/ocop/applications/{applicationId}/extract-evidence', [EvidenceController::class, 'extractInternal'])->name('api.ocop.applications.evidences.extract');
    Route::get('/ocop/evidences/{id}', [EvidenceController::class, 'show'])->name('api.ocop.evidences.show');
    Route::get('/ocop/evidences/{id}/download', [EvidenceController::class, 'downloadUrl'])->name('api.ocop.evidences.download');
    Route::get('/ocop/evidences/{id}/file-stream', [EvidenceController::class, 'fileStream'])->name('api.ocop.evidences.file-stream');
    Route::post('/ocop/evidences/{id}/versions', [EvidenceVersionController::class, 'replaceVersion'])->name('api.ocop.evidences.versions.store');
    Route::post('/ocop/evidences/{id}/links', [EvidenceLinkController::class, 'linkToIndicator'])->name('api.ocop.evidences.links.store');
    Route::delete('/ocop/evidences/{id}/links/{indicatorId}', [EvidenceLinkController::class, 'unlinkFromIndicator'])->name('api.ocop.evidences.links.destroy');
    Route::post('/ocop/evidences/{id}/verify', [EvidenceController::class, 'verify'])->name('api.ocop.evidences.verify');

    // OCOP Evaluation Sessions, Scoring & Decisions (Section 32 of 12_API_SPECIFICATION.md)
    Route::get('/ocop/evaluation-sessions', [EvaluationSessionController::class, 'index'])->name('api.ocop.evaluation-sessions.index');
    Route::post('/ocop/evaluation-sessions', [EvaluationSessionController::class, 'store'])->name('api.ocop.evaluation-sessions.store');
    Route::get('/ocop/evaluation-sessions/{id}', [EvaluationSessionController::class, 'show'])->name('api.ocop.evaluation-sessions.show');
    Route::patch('/ocop/evaluation-sessions/{id}', [EvaluationSessionController::class, 'update'])->name('api.ocop.evaluation-sessions.update');
    Route::post('/ocop/evaluation-sessions/{id}/assignments', [EvaluationSessionController::class, 'assignEvaluators'])->name('api.ocop.evaluation-sessions.assignments.store');
    Route::get('/ocop/evaluation-sessions/{sessionId}/scores', [EvaluatorScoreController::class, 'index'])->name('api.ocop.evaluation-sessions.scores.index');
    Route::post('/ocop/evaluation-sessions/{sessionId}/scores', [EvaluatorScoreController::class, 'store'])->name('api.ocop.evaluation-sessions.scores.store');
    Route::post('/ocop/evaluation-scores/{id}/lock', [EvaluatorScoreController::class, 'lock'])->name('api.ocop.evaluation-scores.lock');
    Route::post('/ocop/evaluation-sessions/{id}/consolidate', [ConsolidatedResultController::class, 'consolidate'])->name('api.ocop.evaluation-sessions.consolidate');
    Route::get('/ocop/applications/{applicationId}/decision', [FinalDecisionController::class, 'show'])->name('api.ocop.applications.decision.show');
    Route::post('/ocop/applications/{applicationId}/approve', [FinalDecisionController::class, 'approve'])->name('api.ocop.applications.approve');
    Route::post('/ocop/applications/{applicationId}/reject', [FinalDecisionController::class, 'reject'])->name('api.ocop.applications.reject');

    // Audit Query & Traceability APIs (Section 33 of 12_API_SPECIFICATION.md)
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('api.audit-logs.index');
    Route::get('/audit-logs/{id}', [AuditLogController::class, 'show'])->name('api.audit-logs.show');
    Route::get('/audit-logs/trace/ocop/{applicationId}', [AuditLogController::class, 'traceOcop'])->name('api.audit-logs.trace.ocop');

    // Reports & Dashboard APIs (Section 34 of 12_API_SPECIFICATION.md)
    Route::get('/reports/dashboard', [ReportController::class, 'dashboard'])->name('api.reports.dashboard');
    Route::get('/reports/ocop-readiness/{applicationId}', [ReportController::class, 'ocopReadiness'])->name('api.reports.ocop-readiness');

    // Document Generation & Certificate APIs (Section 35 of 12_API_SPECIFICATION.md)
    Route::post('/documents/generate/ocop-dossier/{applicationId}', [DocumentController::class, 'generateDossier'])->name('api.documents.generate.dossier');
    Route::post('/documents/generate/certificate/{applicationId}', [DocumentController::class, 'generateCertificate'])->name('api.documents.generate.certificate');
    Route::get('/documents/preview/form-01/{applicationId}', [DocumentController::class, 'previewForm01'])->name('api.documents.preview.form-01');
    Route::get('/documents/preview/form-02/{applicationId}', [DocumentController::class, 'previewForm02'])->name('api.documents.preview.form-02');
    Route::get('/documents/preview/form-03/{applicationId}', [DocumentController::class, 'previewForm03'])->name('api.documents.preview.form-03');
    Route::post('/documents/generate/form-01/{applicationId}', [DocumentController::class, 'generateForm01'])->name('api.documents.generate.form-01');
    Route::post('/documents/generate/form-02/{applicationId}', [DocumentController::class, 'generateForm02'])->name('api.documents.generate.form-02');
    Route::post('/documents/generate/form-03/{applicationId}', [DocumentController::class, 'generateForm03'])->name('api.documents.generate.form-03');
    Route::get('/documents/generate/form-01/{applicationId}', [DocumentController::class, 'generateForm01'])->name('api.documents.generate.form-01.get');
    Route::get('/documents/generate/form-02/{applicationId}', [DocumentController::class, 'generateForm02'])->name('api.documents.generate.form-02.get');
    Route::get('/documents/generate/form-03/{applicationId}', [DocumentController::class, 'generateForm03'])->name('api.documents.generate.form-03.get');
    Route::get('/documents/{id}/download', [DocumentController::class, 'download'])->name('api.documents.download');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('api.notifications.index');
    Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('api.notifications.mark-as-read');
});

