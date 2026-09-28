<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\CreateFarmingLogDTO;
use Modules\Agriculture\Application\DTOs\UpdateFarmingLogDTO;
use Modules\Agriculture\Application\Services\FarmingLogService;
use Modules\Agriculture\Presentation\Http\Requests\CreateFarmingLogRequest;
use Modules\Agriculture\Presentation\Http\Requests\UpdateFarmingLogRequest;
use Modules\Agriculture\Presentation\Http\Resources\FarmingLogResource;

class FarmingLogController extends BaseController
{
    public function __construct(private readonly FarmingLogService $logService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem nhật ký canh tác', status: 403);
        }

        $filters = $request->only(['crop_season_id', 'plot_id', 'activity_type', 'date_from', 'date_to']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-activity_date');

        $paginator = $this->logService->listLogs($filters, $perPage, $sort);

        return ApiResponse::success(
            data: FarmingLogResource::collection($paginator->items()),
            message: 'Lấy nhật ký canh tác thành công',
            meta: [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ]
        );
    }

    public function show(string $id): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết nhật ký canh tác', status: 403);
        }

        $log = $this->logService->getLogById($id);

        return ApiResponse::success(
            data: new FarmingLogResource($log),
            message: 'Lấy thông tin nhật ký canh tác thành công'
        );
    }

    public function store(CreateFarmingLogRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền ghi nhật ký canh tác mới', status: 403);
        }

        $dto = new CreateFarmingLogDTO(
            cropSeasonId: $request->input('crop_season_id'),
            plotId: $request->input('plot_id'),
            activityType: $request->input('activity_type'),
            activityDate: $request->input('activity_date'),
            description: $request->input('description'),
            performedBy: $request->input('performed_by'),
            attachmentReference: $request->input('attachment_reference'),
            materialId: $request->input('material_id'),
            materialBatchNumber: $request->input('material_batch_number'),
            quantityApplied: $request->filled('quantity_applied') ? (float) $request->input('quantity_applied') : null,
            unit: $request->input('unit'),
            phiDays: $request->filled('phi_days') ? (int) $request->input('phi_days') : null,
            gpsLatitude: ($request->input('gps_latitude') ?? $request->input('gps_lat')) !== null ? (float) ($request->input('gps_latitude') ?? $request->input('gps_lat')) : null,
            gpsLongitude: ($request->input('gps_longitude') ?? $request->input('gps_lng')) !== null ? (float) ($request->input('gps_longitude') ?? $request->input('gps_lng')) : null
        );

        $log = $this->logService->createLog($dto);

        return ApiResponse::success(
            data: new FarmingLogResource($log),
            message: 'Ghi nhật ký canh tác thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateFarmingLogRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật nhật ký canh tác', status: 403);
        }

        $dto = new UpdateFarmingLogDTO(
            activityType: $request->input('activity_type'),
            activityDate: $request->input('activity_date'),
            description: $request->input('description'),
            performedBy: $request->input('performed_by'),
            attachmentReference: $request->input('attachment_reference'),
            materialId: $request->input('material_id'),
            materialBatchNumber: $request->input('material_batch_number'),
            quantityApplied: $request->filled('quantity_applied') ? (float) $request->input('quantity_applied') : null,
            unit: $request->input('unit'),
            phiDays: $request->filled('phi_days') ? (int) $request->input('phi_days') : null,
            gpsLatitude: $request->filled('gps_latitude') ? (float) $request->input('gps_latitude') : null,
            gpsLongitude: $request->filled('gps_longitude') ? (float) $request->input('gps_longitude') : null
        );

        $log = $this->logService->updateLog($id, $dto);

        return ApiResponse::success(
            data: new FarmingLogResource($log),
            message: 'Cập nhật nhật ký canh tác thành công'
        );
    }
}
