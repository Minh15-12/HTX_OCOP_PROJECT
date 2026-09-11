<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\CreateHarvestDTO;
use Modules\Agriculture\Application\DTOs\UpdateHarvestDTO;
use Modules\Agriculture\Application\Services\HarvestService;
use Modules\Agriculture\Presentation\Http\Requests\CreateHarvestRequest;
use Modules\Agriculture\Presentation\Http\Requests\UpdateHarvestRequest;
use Modules\Agriculture\Presentation\Http\Resources\HarvestResource;

class HarvestController extends BaseController
{
    public function __construct(private readonly HarvestService $harvestService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin thu hoạch', status: 403);
        }

        $filters = $request->only(['crop_season_id', 'plot_id', 'date_from', 'date_to']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-harvest_date');

        $paginator = $this->harvestService->listHarvests($filters, $perPage, $sort);

        return ApiResponse::success(
            data: HarvestResource::collection($paginator->items()),
            message: 'Lấy danh sách thu hoạch nông sản thành công',
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
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết bản ghi thu hoạch', status: 403);
        }

        $harvest = $this->harvestService->getHarvestById($id);

        return ApiResponse::success(
            data: new HarvestResource($harvest),
            message: 'Lấy chi tiết bản ghi thu hoạch thành công'
        );
    }

    public function store(CreateHarvestRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền ghi nhận thu hoạch mới', status: 403);
        }

        $dto = new CreateHarvestDTO(
            cropSeasonId: $request->input('crop_season_id'),
            plotId: $request->input('plot_id'),
            harvestDate: $request->input('harvest_date'),
            quantity: (float) $request->input('quantity'),
            unit: $request->input('unit'),
            qualityInformation: $request->input('quality_information')
        );

        $harvest = $this->harvestService->createHarvest($dto);

        return ApiResponse::success(
            data: new HarvestResource($harvest),
            message: 'Ghi nhận thu hoạch nông sản thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateHarvestRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật thông tin thu hoạch', status: 403);
        }

        $dto = new UpdateHarvestDTO(
            harvestDate: $request->input('harvest_date'),
            quantity: $request->has('quantity') ? (float) $request->input('quantity') : null,
            unit: $request->input('unit'),
            qualityInformation: $request->input('quality_information')
        );

        $harvest = $this->harvestService->updateHarvest($id, $dto);

        return ApiResponse::success(
            data: new HarvestResource($harvest),
            message: 'Cập nhật thông tin thu hoạch thành công'
        );
    }
}
