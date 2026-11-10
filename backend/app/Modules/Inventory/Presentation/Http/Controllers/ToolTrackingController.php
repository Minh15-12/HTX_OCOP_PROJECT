<?php

namespace Modules\Inventory\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Inventory\Application\Services\ToolTrackingService;
use Modules\Inventory\Presentation\Http\Resources\MemberToolTrackingResource;

class ToolTrackingController extends BaseController
{
    public function __construct(private readonly ToolTrackingService $toolService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách nông cụ', status: 403);
        }

        $filters = $request->only(['member_id', 'status', 'search']);
        $perPage = (int) $request->input('per_page', 50);

        $paginator = $this->toolService->listToolTrackings($filters, $perPage);

        return ApiResponse::success(
            data: MemberToolTrackingResource::collection($paginator->items()),
            message: 'Lấy danh sách nông cụ đang theo dõi (TK 005) thành công',
            meta: [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ]
        );
    }

    public function store(Request $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cấp phát nông cụ', status: 403);
        }

        $validated = $request->validate([
            'member_id' => 'required|uuid',
            'material_id' => 'required|uuid',
            'farm_plot_id' => 'nullable|uuid',
            'serial_number' => 'nullable|string|max:100',
            'quantity' => 'nullable|integer|min:1',
            'assigned_date' => 'nullable|date',
            'note' => 'nullable|string|max:500',
        ]);

        $tracking = $this->toolService->assignTool($validated);

        return ApiResponse::success(
            data: new MemberToolTrackingResource($tracking),
            message: 'Cấp phát nông cụ định danh cho xã viên (TK 005) thành công',
            status: 201
        );
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật trạng thái nông cụ', status: 403);
        }

        $validated = $request->validate([
            'action' => 'required|string|in:REPLACE_1_1,MAINTENANCE,DAMAGED_RETURNED,LOST,IN_USE',
            'note' => 'nullable|string|max:500',
        ]);

        $tracking = $this->toolService->returnOrReplaceTool(
            $id,
            $validated['action'],
            $validated['note'] ?? null
        );

        $msg = $validated['action'] === 'REPLACE_1_1'
            ? 'Đổi mới 1:1 thay thế công cụ hỏng thành công'
            : 'Cập nhật trạng thái nông cụ thành công';

        return ApiResponse::success(
            data: new MemberToolTrackingResource($tracking),
            message: $msg
        );
    }
}
