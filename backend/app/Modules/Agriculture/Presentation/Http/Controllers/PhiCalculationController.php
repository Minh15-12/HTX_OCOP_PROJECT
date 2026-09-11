<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\CalculatePhiDTO;
use Modules\Agriculture\Application\Services\PhiCalculationService;
use Modules\Agriculture\Presentation\Http\Requests\CalculatePhiRequest;
use Modules\Agriculture\Presentation\Http\Resources\PhiCalculationResource;

class PhiCalculationController extends BaseController
{
    public function __construct(private readonly PhiCalculationService $phiService) {}

    public function indexByLog(string $logId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin tính toán PHI', status: 403);
        }

        $calcs = $this->phiService->listPhiCalculationsByLog($logId);

        return ApiResponse::success(
            data: PhiCalculationResource::collection($calcs),
            message: 'Lấy danh sách tính toán thời gian cách ly PHI thành công'
        );
    }

    public function show(string $id): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết tính toán PHI', status: 403);
        }

        $calc = $this->phiService->getPhiCalculationById($id);

        return ApiResponse::success(
            data: new PhiCalculationResource($calc),
            message: 'Lấy chi tiết tính toán thời gian cách ly PHI thành công'
        );
    }

    public function calculate(string $logId, CalculatePhiRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE') && !Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thực hiện tính toán PHI', status: 403);
        }

        $dto = new CalculatePhiDTO(
            farmingLogId: $logId,
            materialId: $request->input('material_id'),
            applicationDate: $request->input('application_date'),
            configuredPhiDays: $request->input('configured_phi_days'),
            sourceReference: $request->input('source_reference')
        );

        $calc = $this->phiService->calculateAndSave($dto);

        return ApiResponse::success(
            data: new PhiCalculationResource($calc),
            message: 'Tính toán và ghi nhận thời gian cách ly PHI thành công',
            status: 201
        );
    }
}
