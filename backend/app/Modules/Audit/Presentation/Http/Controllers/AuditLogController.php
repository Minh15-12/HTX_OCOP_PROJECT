<?php

namespace Modules\Audit\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Audit\Application\Services\AuditQueryService;
use Modules\Audit\Presentation\Http\Resources\AuditLogResource;

class AuditLogController extends BaseController
{
    public function __construct(
        private readonly AuditQueryService $auditQueryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'entity_type',
            'entity_id',
            'actor_id',
            'user_id',
            'cooperative_id',
            'action',
            'date_from',
            'date_to',
        ]);

        // Tenant scope filtering if cooperative context exists
        $user = auth()->user();
        if ($user && $user->cooperative_id && empty($filters['cooperative_id'])) {
            $filters['cooperative_id'] = $user->cooperative_id;
        }

        $perPage = (int) $request->get('per_page', 15);
        $paginator = $this->auditQueryService->listAuditEvents($filters, $perPage);

        return $this->success(
            data: AuditLogResource::collection($paginator->items()),
            message: 'Tải nhật ký kiểm toán hệ thống thành công',
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

    public function show(string $id): JsonResponse
    {
        $event = $this->auditQueryService->getAuditEvent($id);

        return $this->success(
            data: new AuditLogResource($event),
            message: 'Tải thông tin chi tiết nhật ký kiểm toán thành công'
        );
    }

    public function traceOcop(string $applicationId): JsonResponse
    {
        $traceData = $this->auditQueryService->traceOcopApplication($applicationId);

        return $this->success(
            data: $traceData,
            message: 'Truy vết chuỗi lịch sử dữ liệu hồ sơ OCOP thành công'
        );
    }

    public function traceMember(string $memberId): JsonResponse
    {
        $traceData = $this->auditQueryService->traceMember($memberId);

        return $this->success(
            data: $traceData,
            message: 'Truy vết chuỗi lịch sử dữ liệu xã viên thành công'
        );
    }

    public function verifyHashChain(Request $request): JsonResponse
    {
        $coopId = $request->query('cooperative_id');
        $user = auth()->user();
        if ($user && $user->cooperative_id && empty($coopId)) {
            $coopId = $user->cooperative_id;
        }

        $result = $this->auditQueryService->verifyHashChain($coopId);

        return $this->success(
            data: $result,
            message: 'Kiểm tra tính toàn vẹn chuỗi khối kiểm toán SHA-256 thành công'
        );
    }
}
