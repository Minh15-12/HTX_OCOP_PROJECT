<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\CreateCropSeasonDTO;
use Modules\Agriculture\Application\DTOs\UpdateCropSeasonDTO;
use Modules\Agriculture\Application\Services\CropSeasonService;
use Modules\Agriculture\Presentation\Http\Requests\CreateCropSeasonRequest;
use Modules\Agriculture\Presentation\Http\Requests\UpdateCropSeasonRequest;
use Modules\Agriculture\Presentation\Http\Resources\CropSeasonResource;

class CropSeasonController extends BaseController
{
    public function __construct(private readonly CropSeasonService $seasonService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách mùa vụ', status: 403);
        }

        $filters = $request->only(['production_unit_id', 'status', 'crop', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-created_at');

        $paginator = $this->seasonService->listSeasons($filters, $perPage, $sort);

        return ApiResponse::success(
            data: CropSeasonResource::collection($paginator->items()),
            message: 'Lấy danh sách mùa vụ sản xuất thành công',
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
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin mùa vụ', status: 403);
        }

        $season = $this->seasonService->getSeasonById($id);

        return ApiResponse::success(
            data: new CropSeasonResource($season),
            message: 'Lấy thông tin mùa vụ sản xuất thành công'
        );
    }

    public function store(CreateCropSeasonRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền tạo mới mùa vụ', status: 403);
        }

        $dto = new CreateCropSeasonDTO(
            productionUnitId: $request->input('production_unit_id'),
            name: $request->input('name'),
            crop: $request->input('crop'),
            startDate: $request->input('start_date'),
            expectedEndDate: $request->input('expected_end_date'),
            planInformation: $request->input('plan_information')
        );

        $season = $this->seasonService->createSeason($dto);

        return ApiResponse::success(
            data: new CropSeasonResource($season),
            message: 'Tạo mới mùa vụ sản xuất thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateCropSeasonRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật mùa vụ', status: 403);
        }

        $dto = new UpdateCropSeasonDTO(
            name: $request->input('name'),
            crop: $request->input('crop'),
            startDate: $request->input('start_date'),
            expectedEndDate: $request->input('expected_end_date'),
            status: $request->input('status'),
            planInformation: $request->input('plan_information')
        );

        $season = $this->seasonService->updateSeason($id, $dto);

        return ApiResponse::success(
            data: new CropSeasonResource($season),
            message: 'Cập nhật mùa vụ sản xuất thành công'
        );
    }

    public function close(string $id, Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền đóng mùa vụ', status: 403);
        }

        $actualEndDate = $request->input('actual_end_date');
        $season = $this->seasonService->closeSeason($id, $actualEndDate);

        return ApiResponse::success(
            data: new CropSeasonResource($season),
            message: 'Đóng mùa vụ sản xuất thành công'
        );
    }
}
