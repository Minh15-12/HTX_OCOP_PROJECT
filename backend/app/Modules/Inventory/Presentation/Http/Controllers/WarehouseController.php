<?php

namespace Modules\Inventory\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Inventory\Application\Services\WarehouseService;
use Modules\Inventory\Presentation\Http\Requests\CreateWarehouseRequest;
use Modules\Inventory\Presentation\Http\Requests\UpdateWarehouseRequest;
use Modules\Inventory\Presentation\Http\Resources\WarehouseResource;

class WarehouseController extends BaseController
{
    public function __construct(private readonly WarehouseService $warehouseService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách kho vật tư', status: 403);
        }

        $filters = $request->only(['status', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', 'warehouse_code');

        $paginator = $this->warehouseService->listWarehouses($filters, $perPage, $sort);

        return ApiResponse::success(
            data: WarehouseResource::collection($paginator->items()),
            message: 'Lấy danh sách kho vật tư thành công',
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
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết kho vật tư', status: 403);
        }

        $warehouse = $this->warehouseService->getWarehouseById($id);

        return ApiResponse::success(
            data: new WarehouseResource($warehouse),
            message: 'Lấy thông tin kho vật tư thành công'
        );
    }

    public function store(CreateWarehouseRequest $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thêm mới kho vật tư', status: 403);
        }

        $warehouse = $this->warehouseService->createWarehouse($request->validated());

        return ApiResponse::success(
            data: new WarehouseResource($warehouse),
            message: 'Tạo mới kho vật tư thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateWarehouseRequest $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật kho vật tư', status: 403);
        }

        $warehouse = $this->warehouseService->updateWarehouse($id, $request->validated());

        return ApiResponse::success(
            data: new WarehouseResource($warehouse),
            message: 'Cập nhật kho vật tư thành công'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.DELETE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xóa kho vật tư', status: 403);
        }

        $this->warehouseService->deleteWarehouse($id);

        return ApiResponse::success(
            data: ['id' => $id],
            message: 'Xóa kho vật tư thành công'
        );
    }
}
