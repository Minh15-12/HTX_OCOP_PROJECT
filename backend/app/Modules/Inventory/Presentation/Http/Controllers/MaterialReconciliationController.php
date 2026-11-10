<?php

namespace Modules\Inventory\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Inventory\Application\Services\MaterialReconciliationService;

class MaterialReconciliationController extends BaseController
{
    public function __construct(private readonly MaterialReconciliationService $reconciliationService) {}

    public function reconcile(Request $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thực hiện đối soát vật tư', status: 403);
        }

        $seasonId = $request->input('crop_season_id');
        if (!$seasonId) {
            return ApiResponse::error('VALIDATION_ERROR', 'Vui lòng chọn mùa vụ canh tác để đối soát cân bằng vật tư', status: 422);
        }

        $report = $this->reconciliationService->reconcileSeasonMaterials($seasonId);

        return ApiResponse::success(
            data: $report,
            message: 'Thực hiện phép thử cộng sổ đối soát cân bằng vật tư vụ mùa thành công'
        );
    }
}
