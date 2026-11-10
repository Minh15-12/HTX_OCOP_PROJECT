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
use Modules\Ocop\Services\OcopScoreSuggestionService;

class OcopApplicationController extends BaseController
{
    public function __construct(
        private readonly OcopApplicationService $applicationService,
        private readonly OcopScoreSuggestionService $scoreSuggestionService
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

    public function readyForSubmission(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->error('UNAUTHENTICATED', 'Chưa đăng nhập', 401);
        }

        $forbiddenRoles = ['STOREKEEPER', 'ACCOUNTANT', 'EVALUATOR', 'COUNCIL_MEMBER', 'AUDITOR', 'MEMBER', 'HTX_MEMBER'];
        foreach ($forbiddenRoles as $forbiddenRole) {
            if ($user->hasRole($forbiddenRole) && !$user->hasRole('HTX_OWNER') && !$user->hasRole('SYSTEM_ADMIN')) {
                return $this->error(
                    code: 'FORBIDDEN_ROLE',
                    message: 'Vai trò của bạn không có thẩm quyền chuẩn bị nộp hồ sơ OCOP',
                    status: 403
                );
            }
        }

        $authorized = $user->hasPermission('OCOP_APPLICATION.UPDATE')
            || $user->hasPermission('OCOP_APPLICATION.SUBMIT')
            || $user->hasRole('HTX_OWNER')
            || $user->hasRole('HTX_DIRECTOR')
            || $user->hasRole('COOP_ADMIN')
            || $user->hasRole('HTX_STAFF')
            || $user->hasRole('OCOP_PREPARER')
            || $user->hasRole('SYSTEM_ADMIN');

        if (!$authorized) {
            return $this->error(
                code: 'FORBIDDEN',
                message: 'Bạn không có quyền chuyển trạng thái sẵn sàng nộp hồ sơ OCOP',
                status: 403
            );
        }

        $app = $this->applicationService->markReadyForSubmission($id);

        return $this->success(
            data: new ApplicationDetailResource($app),
            message: 'Xác nhận hồ sơ sẵn sàng nộp thành công'
        );
    }

    public function submit(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->error('UNAUTHENTICATED', 'Chưa đăng nhập', 401);
        }

        // SoD Defense: roles strictly forbidden from submitting legal OCOP dossiers
        $forbiddenRoles = ['STOREKEEPER', 'ACCOUNTANT', 'EVALUATOR', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'AUDITOR', 'MEMBER', 'HTX_MEMBER'];
        foreach ($forbiddenRoles as $forbiddenRole) {
            if ($user->hasRole($forbiddenRole) && !$user->hasRole('HTX_OWNER') && !$user->hasRole('SYSTEM_ADMIN')) {
                return $this->error(
                    code: 'FORBIDDEN_ROLE',
                    message: 'Vai trò của bạn không có thẩm quyền nộp hồ sơ OCOP',
                    status: 403
                );
            }
        }

        // Permitted cooperative roles & permissions
        $authorized = $user->hasPermission('OCOP_APPLICATION.SUBMIT')
            || $user->hasRole('HTX_OWNER')
            || $user->hasRole('HTX_DIRECTOR')
            || $user->hasRole('COOP_ADMIN')
            || $user->hasRole('HTX_STAFF')
            || $user->hasRole('OCOP_PREPARER')
            || $user->hasRole('SYSTEM_ADMIN');

        if (!$authorized) {
            return $this->error(
                code: 'FORBIDDEN',
                message: 'Chỉ Chủ tịch/Đại diện HTX hoặc tài khoản có quyền nộp hồ sơ OCOP mới có thể thực hiện thao tác này',
                status: 403
            );
        }

        $app = $this->applicationService->submitApplication($id, $user->id);

        return $this->success(
            data: new ApplicationDetailResource($app),
            message: 'Nộp hồ sơ OCOP thành công. Hồ sơ đã chuyển sang trạng thái khóa (Read-Only)'
        );
    }

    public function scoreSuggestions(string $id): JsonResponse
    {
        $suggestions = $this->scoreSuggestionService->getScoreSuggestions($id);

        return $this->success(
            data: $suggestions,
            message: 'Tải danh sách gợi ý điểm tự chấm OCOP thông minh thành công'
        );
    }
}
