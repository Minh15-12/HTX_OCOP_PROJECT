<?php

namespace Modules\Inventory\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Inventory\Application\DTOs\CreateMaterialDTO;
use Modules\Inventory\Application\DTOs\UpdateMaterialDTO;
use Modules\Inventory\Application\Services\MaterialService;
use Modules\Inventory\Presentation\Http\Requests\CreateMaterialRequest;
use Modules\Inventory\Presentation\Http\Requests\UpdateMaterialRequest;
use Modules\Inventory\Presentation\Http\Resources\MaterialResource;

class MaterialController extends BaseController
{
    public function __construct(private readonly MaterialService $materialService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh mục vật tư', status: 403);
        }

        $filters = $request->only(['category', 'status', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-created_at');

        $paginator = $this->materialService->listMaterials($filters, $perPage, $sort);

        return ApiResponse::success(
            data: MaterialResource::collection($paginator->items()),
            message: 'Lấy danh sách vật tư thành công',
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
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết vật tư', status: 403);
        }

        $material = $this->materialService->getMaterialById($id);

        return ApiResponse::success(
            data: new MaterialResource($material),
            message: 'Lấy chi tiết vật tư thành công'
        );
    }

    public function store(CreateMaterialRequest $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền tạo mới vật tư', status: 403);
        }

        $dto = new CreateMaterialDTO(
            sku: $request->input('sku'),
            name: $request->input('name'),
            category: $request->input('category'),
            unit: $request->input('unit'),
            safetyInformation: $request->input('safety_information'),
            reorderThreshold: (float) $request->input('reorder_threshold', 0.0),
            cooperativeId: $request->input('cooperative_id')
        );

        $material = $this->materialService->createMaterial($dto);

        return ApiResponse::success(
            data: new MaterialResource($material),
            message: 'Tạo mới vật tư thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateMaterialRequest $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật thông tin vật tư', status: 403);
        }

        $dto = new UpdateMaterialDTO(
            name: $request->input('name'),
            category: $request->input('category'),
            unit: $request->input('unit'),
            safetyInformation: $request->input('safety_information'),
            reorderThreshold: $request->has('reorder_threshold') ? (float) $request->input('reorder_threshold') : null,
            status: $request->input('status')
        );

        $material = $this->materialService->updateMaterial($id, $dto);

        return ApiResponse::success(
            data: new MaterialResource($material),
            message: 'Cập nhật thông tin vật tư thành công'
        );
    }
}
