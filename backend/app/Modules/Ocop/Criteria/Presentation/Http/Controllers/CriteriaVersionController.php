<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Ocop\Criteria\Application\DTOs\CreateCriteriaVersionDTO;
use Modules\Ocop\Criteria\Application\DTOs\UpdateCriteriaVersionDTO;
use Modules\Ocop\Criteria\Application\Services\CriteriaVersionService;
use Modules\Ocop\Criteria\Presentation\Http\Requests\CreateCriteriaVersionRequest;
use Modules\Ocop\Criteria\Presentation\Http\Requests\UpdateCriteriaVersionRequest;
use Modules\Ocop\Criteria\Presentation\Http\Resources\CriteriaVersionResource;

class CriteriaVersionController extends BaseController
{
    public function __construct(
        private readonly CriteriaVersionService $versionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search']);
        $perPage = (int) $request->get('per_page', 15);
        $sort = (string) $request->get('sort', '-created_at');

        $paginator = $this->versionService->listVersions($filters, $perPage, $sort);

        $resourceCollection = CriteriaVersionResource::collection($paginator->items());

        return $this->success(
            data: $resourceCollection,
            message: 'Tải danh sách phiên bản bộ tiêu chí thành công',
            meta: [
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ]
        );
    }

    public function store(CreateCriteriaVersionRequest $request): JsonResponse
    {
        $dto = CreateCriteriaVersionDTO::fromArray($request->validated());
        $version = $this->versionService->createVersion($dto);

        return $this->success(
            data: new CriteriaVersionResource($version),
            message: 'Tạo bản nháp phiên bản bộ tiêu chí thành công',
            status: 201
        );
    }

    public function show(string $id): JsonResponse
    {
        $version = $this->versionService->getVersionById($id);

        return $this->success(
            data: new CriteriaVersionResource($version),
            message: 'Tải thông tin phiên bản bộ tiêu chí thành công'
        );
    }

    public function update(string $id, UpdateCriteriaVersionRequest $request): JsonResponse
    {
        $dto = UpdateCriteriaVersionDTO::fromArray($request->validated());
        $version = $this->versionService->updateVersion($id, $dto);

        return $this->success(
            data: new CriteriaVersionResource($version),
            message: 'Cập nhật phiên bản bộ tiêu chí thành công'
        );
    }

    public function publish(string $id): JsonResponse
    {
        $version = $this->versionService->publishVersion($id);

        return $this->success(
            data: new CriteriaVersionResource($version),
            message: 'Phát hành phiên bản bộ tiêu chí thành công'
        );
    }
}
