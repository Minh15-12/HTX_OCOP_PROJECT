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
use Modules\Agriculture\Presentation\Http\Requests\RejectFarmingLogRequest;
use Modules\Agriculture\Presentation\Http\Requests\UpdateFarmingLogRequest;
use Modules\Agriculture\Presentation\Http\Requests\VerifyFarmingLogRequest;
use Modules\Agriculture\Presentation\Http\Resources\FarmingLogResource;

class FarmingLogController extends BaseController
{
    public function __construct(private readonly FarmingLogService $logService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem nhật ký canh tác', status: 403);
        }

        $filters = $request->only(['crop_season_id', 'plot_id', 'activity_type', 'status', 'is_backdated', 'date_from', 'date_to']);
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
            gpsLongitude: ($request->input('gps_longitude') ?? $request->input('gps_lng')) !== null ? (float) ($request->input('gps_longitude') ?? $request->input('gps_lng')) : null,
            fertigationMethod: $request->input('fertigation_method'),
            ecSolution: $request->filled('ec_solution') ? (float) $request->input('ec_solution') : null,
            ecDrain: $request->filled('ec_drain') ? (float) $request->input('ec_drain') : null,
            phSolution: $request->filled('ph_solution') ? (float) $request->input('ph_solution') : null,
            tankComposition: $request->input('tank_composition'),
            pestTarget: $request->input('pest_target'),
            pestDensity: $request->input('pest_density'),
            activeIngredient: $request->input('active_ingredient'),
            resistanceGroup: $request->input('resistance_group'),
            materialLotNumber: $request->input('material_lot_number'),
            materialExportSlipCode: $request->input('material_export_slip_code'),
            biocontrolAgentName: $request->input('biocontrol_agent_name'),
            biocontrolReleaseRate: $request->input('biocontrol_release_rate'),
            waterVolumeLiters: $request->filled('water_volume_liters') ? (float) $request->input('water_volume_liters') : null,
            applicationEquipment: $request->input('application_equipment'),
            clientUuid: $request->input('client_uuid'),
            items: $request->input('items'),
            voiceRawText: $request->input('voice_raw_text'),
            status: $request->input('status')
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

    public function destroy(string $id): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.DELETE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xóa nhật ký canh tác', status: 403);
        }

        $this->logService->deleteLog($id);

        return ApiResponse::success(
            data: ['id' => $id],
            message: 'Xóa nhật ký canh tác thành công'
        );
    }

    /**
     * Thẩm định nhật ký canh tác (Hệ thống Kiểm soát Nội bộ - ICS)
     */
    public function verify(string $id, VerifyFarmingLogRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thẩm định nhật ký canh tác', status: 403);
        }

        $log = $this->logService->verifyLog($id, auth()->id(), $request->input('notes'));

        return ApiResponse::success(
            data: new FarmingLogResource($log),
            message: 'Đã thẩm định và xác nhận nhật ký canh tác hợp lệ'
        );
    }

    /**
     * Từ chối nhật ký canh tác (Yêu cầu giải trình)
     */
    public function reject(string $id, RejectFarmingLogRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền từ chối nhật ký canh tác', status: 403);
        }

        $log = $this->logService->rejectLog($id, auth()->id(), $request->input('rejection_reason'));

        return ApiResponse::success(
            data: new FarmingLogResource($log),
            message: 'Đã từ chối nhật ký canh tác và yêu cầu giải trình'
        );
    }

    /**
     * Đồng bộ ngoại tuyến hàng loạt (Offline PWA Sync)
     */
    public function batchSync(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền ghi nhận đồng bộ nhật ký canh tác', status: 403);
        }

        $logs = $request->input('logs', []);
        if (!is_array($logs) || empty($logs)) {
            return ApiResponse::error('INVALID_PAYLOAD', 'Danh sách nhật ký cần đồng bộ không hợp lệ', status: 422);
        }

        $results = $this->logService->batchSync($logs);

        return ApiResponse::success(
            data: $results,
            message: 'Đã xử lý đồng bộ ' . count($results) . ' bản ghi nhật ký ngoại tuyến'
        );
    }

    /**
     * Lấy danh mục 31 hoạt chất cấm theo Thông tư 75/2025/TT-BNNMT
     */
    public function bannedPesticides(): JsonResponse
    {
        $list = $this->logService->getBannedPesticides();

        return ApiResponse::success(
            data: $list,
            message: 'Danh mục hoạt chất thuốc BVTV cấm sử dụng theo Thông tư 75/2025/TT-BNNMT'
        );
    }
}
