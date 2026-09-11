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
            landRelation: $request->input('land_relation')
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
}
