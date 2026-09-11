<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\CreateLotDTO;
use Modules\Agriculture\Application\Services\LotService;
use Modules\Agriculture\Presentation\Http\Requests\CreateLotRequest;
use Modules\Agriculture\Presentation\Http\Resources\LotResource;

class LotController extends BaseController
{
    public function __construct(private readonly LotService $lotService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách lô sản phẩm', status: 403);
        }

        $filters = $request->only(['search', 'status']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-created_at');

        $paginator = $this->lotService->listLots($filters, $perPage, $sort);

        return ApiResponse::success(
            data: LotResource::collection($paginator->items()),
            message: 'Lấy danh sách lô sản phẩm thành công',
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
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin lô sản phẩm', status: 403);
        }

        $lot = $this->lotService->getLotById($id);

        return ApiResponse::success(
            data: new LotResource($lot),
            message: 'Lấy thông tin lô sản phẩm thành công'
        );
    }

    public function traceability(string $id): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền truy xuất nguồn gốc lô sản phẩm', status: 403);
        }

        $tree = $this->lotService->getLotTraceability($id);

        return ApiResponse::success(
            data: $tree,
            message: 'Truy xuất nguồn gốc lô sản phẩm thành công'
        );
    }

    public function store(CreateLotRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền khởi tạo lô sản phẩm', status: 403);
        }

        $dto = new CreateLotDTO(
            harvestId: $request->input('harvest_id'),
            quantity: $request->has('quantity') ? (float) $request->input('quantity') : null,
            unit: $request->input('unit'),
            customLotCode: $request->input('custom_lot_code'),
            sourceInformation: $request->input('source_information')
        );

        $lot = $this->lotService->createLot($dto);

        return ApiResponse::success(
            data: new LotResource($lot),
            message: 'Khởi tạo lô sản phẩm thành công',
            status: 201
        );
    }
}
