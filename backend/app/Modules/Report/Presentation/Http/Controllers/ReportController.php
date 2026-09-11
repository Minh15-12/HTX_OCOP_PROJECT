<?php

namespace Modules\Report\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Report\Application\Services\DashboardReportService;

class ReportController extends BaseController
{
    public function __construct(
        private readonly DashboardReportService $dashboardReportService
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        $cooperativeId = $request->get('cooperative_id');
        $summary = $this->dashboardReportService->getDashboardSummary($cooperativeId);

        return $this->success(
            data: $summary,
            message: 'Tải dữ liệu tổng quan Dashboard thành công'
        );
    }

    public function ocopReadiness(string $applicationId): JsonResponse
    {
        $readiness = $this->dashboardReportService->getOcopReadiness($applicationId);

        return $this->success(
            data: $readiness,
            message: 'Tải báo cáo tiến độ sẵn sàng nộp hồ sơ OCOP thành công'
        );
    }
}
