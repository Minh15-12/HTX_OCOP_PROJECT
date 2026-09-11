<?php

namespace Modules\Inventory\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Inventory\Application\DTOs\CreateStockCountDTO;
use Modules\Inventory\Application\DTOs\StockCountLineDTO;
use Modules\Inventory\Application\Services\StockCountService;
use Modules\Inventory\Presentation\Http\Requests\CreateStockCountRequest;
use Modules\Inventory\Presentation\Http\Resources\StockCountResource;

class StockCountController extends BaseController
{
    public function __construct(private readonly StockCountService $countService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem phiếu kiểm kê kho', status: 403);
        }

        $filters = $request->only(['status', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-count_date');

        $paginator = $this->countService->listCounts($filters, $perPage, $sort);

        return ApiResponse::success(
            data: StockCountResource::collection($paginator->items()),
            message: 'Lấy danh sách phiếu kiểm kê kho thành công',
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
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết phiếu kiểm kê kho', status: 403);
        }

        $count = $this->countService->getCountById($id);

        return ApiResponse::success(
            data: new StockCountResource($count),
            message: 'Lấy chi tiết phiếu kiểm kê kho thành công'
        );
    }

    public function store(CreateStockCountRequest $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền lập phiếu kiểm kê kho mới', status: 403);
        }

        $lineDtos = [];
        foreach ($request->input('lines') as $line) {
            $lineDtos[] = new StockCountLineDTO(
                materialId: $line['material_id'],
                actualQuantity: (float) $line['actual_quantity'],
                reason: $line['reason'] ?? null
            );
        }

        $dto = new CreateStockCountDTO(
            countDate: $request->input('count_date'),
            lines: $lineDtos,
            reason: $request->input('reason'),
            scope: $request->input('scope'),
            customCountNumber: $request->input('custom_count_number'),
            cooperativeId: $request->input('cooperative_id')
        );

        $count = $this->countService->createCount($dto);

        return ApiResponse::success(
            data: new StockCountResource($count),
            message: 'Khởi tạo phiếu kiểm kê kho thành công',
            status: 201
        );
    }

    public function complete(string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền hoàn thành phiếu kiểm kê', status: 403);
        }

        $count = $this->countService->completeCount($id);

        return ApiResponse::success(
            data: new StockCountResource($count),
            message: 'Hoàn thành phiếu kiểm kê kho thành công'
        );
    }

    public function approve(string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phê duyệt phiếu kiểm kê', status: 403);
        }

        $count = $this->countService->approveCount($id);

        return ApiResponse::success(
            data: new StockCountResource($count),
            message: 'Phê duyệt phiếu kiểm kê kho thành công'
        );
    }
}
