<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\AssignMemberPlotDTO;
use Modules\Agriculture\Application\DTOs\CreateFarmPlotDTO;
use Modules\Agriculture\Application\Services\FarmPlotService;
use Modules\Agriculture\Presentation\Http\Requests\AssignMemberPlotRequest;
use Modules\Agriculture\Presentation\Http\Requests\CreateFarmPlotRequest;
use Modules\Agriculture\Presentation\Http\Resources\FarmPlotResource;
use Modules\Agriculture\Presentation\Http\Resources\MemberPlotAssignmentResource;

class FarmPlotController extends BaseController
{
    public function __construct(private readonly FarmPlotService $plotService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách thửa đất', status: 403);
        }

        $filters = $request->only(['status', 'production_unit_id', 'member_id', 'search']);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->plotService->listAllPlots($filters, $perPage);

        return ApiResponse::success(
            data: FarmPlotResource::collection($paginator->items()),
            message: 'Lấy danh sách thửa đất toàn Hợp tác xã thành công',
            meta: [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ]
        );
    }

    public function indexByMember(string $memberId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ') && !Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách thửa đất của xã viên', status: 403);
        }

        $plots = $this->plotService->listPlotsByMember($memberId);

        return ApiResponse::success(
            data: FarmPlotResource::collection($plots),
            message: 'Lấy danh sách thửa đất của xã viên thành công'
        );
    }

    public function indexByUnit(string $unitId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách thửa đất', status: 403);
        }

        $plots = $this->plotService->listPlotsByProductionUnit($unitId);

        return ApiResponse::success(
            data: FarmPlotResource::collection($plots),
            message: 'Lấy danh sách thửa đất theo Vùng sản xuất thành công'
        );
    }

    public function show(string $plotId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết thửa đất', status: 403);
        }

        $plot = $this->plotService->getPlotById($plotId);

        return ApiResponse::success(
            data: new FarmPlotResource($plot),
            message: 'Lấy thông tin chi tiết thửa đất thành công'
        );
    }

    public function storeInUnit(string $unitId, CreateFarmPlotRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền tạo thửa đất canh tác mới', status: 403);
        }

        $dto = new CreateFarmPlotDTO(
            productionUnitId: $unitId,
            plotCode: $request->input('plot_code'),
            area: (float) $request->input('area'),
            landRelation: $request->input('land_relation'),
            nationalCadastralCode: $request->input('national_cadastral_code'),
            landSheetNumber: $request->input('land_sheet_number'),
            landParcelNumber: $request->input('land_parcel_number'),
            substrateBagCount: $request->input('substrate_bag_count') ? (int) $request->input('substrate_bag_count') : null,
            plantingDensityPerSqm: $request->input('planting_density_per_sqm') ? (float) $request->input('planting_density_per_sqm') : null,
            greenhouseType: $request->input('greenhouse_type'),
            geometryGeojson: $request->input('geometry_geojson'),
            vn2000Coordinates: $request->input('vn2000_coordinates'),
            maxYieldRatePerSqm: $request->has('max_yield_rate_per_sqm') ? (float) $request->input('max_yield_rate_per_sqm') : null,
            landContractExpiredAt: $request->input('land_contract_expired_at')
        );

        $plot = $this->plotService->createFarmPlot($dto);

        return ApiResponse::success(
            data: new FarmPlotResource($plot),
            message: 'Thêm mới thửa đất canh tác thành công',
            status: 201
        );
    }

    public function listAssignments(string $plotId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách phân công thửa đất', status: 403);
        }

        $assignments = $this->plotService->listPlotMemberAssignments($plotId);

        return ApiResponse::success(
            data: MemberPlotAssignmentResource::collection($assignments),
            message: 'Lấy danh sách phân công thửa đất thành công'
        );
    }

    public function assignMember(string $plotId, AssignMemberPlotRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phân công xã viên canh tác thửa đất', status: 403);
        }

        $dto = new AssignMemberPlotDTO(
            memberId: $request->input('member_id'),
            startDate: $request->input('start_date'),
            assignmentType: $request->input('assignment_type', 'OWNER'),
            endDate: $request->input('end_date')
        );

        $assignment = $this->plotService->assignMemberToPlot($plotId, $dto);

        return ApiResponse::success(
            data: new MemberPlotAssignmentResource($assignment),
            message: 'Phân công xã viên canh tác thửa đất thành công',
            status: 201
        );
    }

    public function update(string $plotId, Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật thông tin thửa đất', status: 403);
        }

        $request->validate([
            'plot_code' => ['sometimes', 'string', 'max:50'],
            'area' => ['sometimes', 'numeric', 'min:0.01'],
            'status' => ['sometimes', 'string'],
            'land_relation' => ['sometimes', 'array'],
            'national_cadastral_code' => ['sometimes', 'nullable', 'string', 'max:100'],
            'land_sheet_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'land_parcel_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'substrate_bag_count' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'planting_density_per_sqm' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'greenhouse_type' => ['sometimes', 'nullable', 'string', 'in:HIGH_TECH_GREENHOUSE,NET_HOUSE,OPEN_FIELD'],
            'geometry_geojson' => ['sometimes', 'nullable', 'array'],
            'vn2000_coordinates' => ['sometimes', 'nullable', 'array'],
            'max_yield_rate_per_sqm' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'land_contract_expired_at' => ['sometimes', 'nullable', 'date'],
        ]);

        $plot = $this->plotService->updateFarmPlot($plotId, $request->all());

        return ApiResponse::success(
            data: new FarmPlotResource($plot),
            message: 'Cập nhật thửa đất thành công'
        );
    }

    public function destroy(string $plotId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.DELETE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xóa thửa đất', status: 403);
        }

        $this->plotService->deleteFarmPlot($plotId);

        return ApiResponse::success(
            data: ['id' => $plotId],
            message: 'Xóa thửa đất thành công'
        );
    }
}

