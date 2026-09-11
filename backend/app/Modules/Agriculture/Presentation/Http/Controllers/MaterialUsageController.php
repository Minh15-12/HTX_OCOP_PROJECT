<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\CreateMaterialUsageDTO;
use Modules\Agriculture\Application\Services\MaterialUsageService;
use Modules\Agriculture\Presentation\Http\Requests\CreateMaterialUsageRequest;
use Modules\Agriculture\Presentation\Http\Resources\MaterialUsageResource;

class MaterialUsageController extends BaseController
{
    public function __construct(private readonly MaterialUsageService $usageService) {}

    public function indexByLog(string $logId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin vật tư sử dụng', status: 403);
        }

        $usages = $this->usageService->listUsagesByLog($logId);

        return ApiResponse::success(
            data: MaterialUsageResource::collection($usages),
            message: 'Lấy danh sách vật tư sử dụng theo nhật ký canh tác thành công'
        );
    }

    public function storeInLog(string $logId, CreateMaterialUsageRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền ghi nhận vật tư sử dụng', status: 403);
        }

        $dto = new CreateMaterialUsageDTO(
            farmingLogId: $logId,
            materialId: $request->input('material_id'),
            quantity: (float) $request->input('quantity'),
            unit: $request->input('unit'),
            batchReference: $request->input('batch_reference')
        );

        $usage = $this->usageService->createUsage($dto);

        return ApiResponse::success(
            data: new MaterialUsageResource($usage),
            message: 'Ghi nhận vật tư sử dụng thành công',
            status: 201
        );
    }

    public function destroy(string $id): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xóa vật tư sử dụng', status: 403);
        }

        $this->usageService->deleteUsage($id);

        return ApiResponse::success(
            data: null,
            message: 'Xóa vật tư sử dụng thành công'
        );
    }
}
