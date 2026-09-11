<?php

namespace Modules\Ocop\Dossier\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Ocop\Dossier\Application\DTOs\CreateOcopApplicationDTO;
use Modules\Ocop\Dossier\Application\DTOs\UpdateOcopApplicationDTO;
use Modules\Ocop\Dossier\Application\Services\OcopApplicationService;
use Modules\Ocop\Dossier\Presentation\Http\Requests\CreateOcopApplicationRequest;
use Modules\Ocop\Dossier\Presentation\Http\Requests\UpdateOcopApplicationRequest;
use Modules\Ocop\Dossier\Presentation\Http\Resources\ApplicationDetailResource;
use Modules\Ocop\Dossier\Presentation\Http\Resources\OcopApplicationResource;

class OcopApplicationController extends BaseController
{
    public function __construct(
        private readonly OcopApplicationService $applicationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'product_id', 'criteria_version_id', 'search']);
        $perPage = (int) $request->get('per_page', 15);
        $sort = (string) $request->get('sort', '-created_at');

        $paginator = $this->applicationService->listApplications($filters, $perPage, $sort);

        return $this->success(
            data: OcopApplicationResource::collection($paginator->items()),
            message: 'Tải danh sách hồ sơ OCOP thành công',
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

    public function store(CreateOcopApplicationRequest $request): JsonResponse
    {
        $dto = CreateOcopApplicationDTO::fromArray($request->validated());
        $app = $this->applicationService->createApplication($dto);

        return $this->success(
            data: new OcopApplicationResource($app),
            message: 'Khởi tạo hồ sơ OCOP thành công',
            status: 201
        );
    }

    public function show(string $id): JsonResponse
    {
        $app = $this->applicationService->getApplicationById($id);

        return $this->success(
            data: new ApplicationDetailResource($app),
            message: 'Tải thông tin chi tiết hồ sơ OCOP thành công'
        );
    }

    public function update(string $id, UpdateOcopApplicationRequest $request): JsonResponse
    {
        $dto = UpdateOcopApplicationDTO::fromArray($request->validated());
        $app = $this->applicationService->updateApplication($id, $dto);

        return $this->success(
            data: new OcopApplicationResource($app),
            message: 'Cập nhật thông tin hồ sơ OCOP thành công'
        );
    }

    public function readyForSubmission(string $id): JsonResponse
    {
        $app = $this->applicationService->markReadyForSubmission($id);

        return $this->success(
            data: new ApplicationDetailResource($app),
            message: 'Xác nhận hồ sơ sẵn sàng nộp thành công'
        );
    }

    public function submit(string $id): JsonResponse
    {
        $app = $this->applicationService->submitApplication($id);

        return $this->success(
            data: new ApplicationDetailResource($app),
            message: 'Nộp hồ sơ OCOP thành công. Hồ sơ đã chuyển sang trạng thái khóa (Read-Only)'
        );
    }
}
