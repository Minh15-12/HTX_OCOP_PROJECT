<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\CreateProductionUnitDTO;
use Modules\Agriculture\Application\DTOs\UpdateProductionUnitDTO;
use Modules\Agriculture\Application\Services\ProductionUnitService;
use Modules\Agriculture\Presentation\Http\Requests\CreateProductionUnitRequest;
use Modules\Agriculture\Presentation\Http\Requests\UpdateProductionUnitRequest;
use Modules\Agriculture\Presentation\Http\Resources\ProductionUnitResource;

class ProductionUnitController extends BaseController
{
    public function __construct(private readonly ProductionUnitService $unitService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách vùng sản xuất', status: 403);
        }

        $filters = $request->only(['search', 'status', 'crop']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-created_at');

        $paginator = $this->unitService->listProductionUnits($filters, $perPage, $sort);

        return ApiResponse::success(
            data: ProductionUnitResource::collection($paginator->items()),
            message: 'Lấy danh sách vùng sản xuất thành công',
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
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin vùng sản xuất', status: 403);
        }

        $unit = $this->unitService->getProductionUnitById($id);

        return ApiResponse::success(
            data: new ProductionUnitResource($unit),
            message: 'Lấy thông tin vùng sản xuất thành công'
        );
    }

    public function store(CreateProductionUnitRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền khởi tạo vùng sản xuất', status: 403);
        }

        $dto = new CreateProductionUnitDTO(
            unitCode: $request->input('unit_code'),
            name: $request->input('name'),
            crop: $request->input('crop'),
            area: (float) $request->input('area'),
            location: $request->input('location'),
            registrationInformation: $request->input('registration_information'),
            cooperativeId: $request->input('cooperative_id')
        );

        $unit = $this->unitService->createProductionUnit($dto);

        return ApiResponse::success(
            data: new ProductionUnitResource($unit),
            message: 'Tạo mới vùng sản xuất thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateProductionUnitRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật vùng sản xuất', status: 403);
        }

        $dto = new UpdateProductionUnitDTO(
            name: $request->input('name'),
            crop: $request->input('crop'),
            area: $request->has('area') ? (float) $request->input('area') : null,
            location: $request->input('location'),
            status: $request->input('status'),
            registrationInformation: $request->input('registration_information')
        );

        $unit = $this->unitService->updateProductionUnit($id, $dto);

        return ApiResponse::success(
            data: new ProductionUnitResource($unit),
            message: 'Cập nhật vùng sản xuất thành công'
        );
    }
}
