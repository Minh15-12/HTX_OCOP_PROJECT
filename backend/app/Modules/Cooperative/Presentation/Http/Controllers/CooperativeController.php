<?php

namespace Modules\Cooperative\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;

class CooperativeController extends BaseController
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function showMyCooperative(Request $request): JsonResponse
    {
        if (!Gate::allows('COOPERATIVE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin Hợp tác xã', status: 403);
        }

        $coopId = $this->tenantContext->getCooperativeId();
        if (!$coopId) {
            return ApiResponse::error('TENANT_NOT_FOUND', 'Không tìm thấy thông tin Hợp tác xã cho người dùng', status: 404);
        }

        $cooperative = CooperativeModel::find($coopId);
        if (!$cooperative) {
            return ApiResponse::error('RESOURCE_NOT_FOUND', 'Hợp tác xã không tồn tại trong hệ thống', status: 404);
        }

        return ApiResponse::success(
            data: $cooperative,
            message: 'Lấy thông tin Hợp tác xã thành công'
        );
    }

    public function updateMyCooperative(Request $request): JsonResponse
    {
        if (!Gate::allows('COOPERATIVE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật thông tin Hợp tác xã', status: 403);
        }

        $coopId = $this->tenantContext->getCooperativeId();
        if (!$coopId) {
            return ApiResponse::error('TENANT_NOT_FOUND', 'Không tìm thấy thông tin Hợp tác xã cho người dùng', status: 404);
        }

        $cooperative = CooperativeModel::find($coopId);
        if (!$cooperative) {
            return ApiResponse::error('RESOURCE_NOT_FOUND', 'Hợp tác xã không tồn tại trong hệ thống', status: 404);
        }

        $validated = $request->validate([
            'legal_name' => 'sometimes|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'legal_information' => 'nullable|array',
            'contact_information' => 'nullable|array',
        ]);

        $before = $cooperative->toArray();
        $cooperative->update($validated);

        $this->auditService->log(
            action: 'COOPERATIVE_UPDATED',
            entityType: 'Cooperative',
            entityId: $cooperative->id,
            before: $before,
            after: $cooperative->toArray(),
            cooperativeId: $cooperative->id
        );

        return ApiResponse::success(
            data: $cooperative,
            message: 'Cập nhật thông tin Hợp tác xã thành công'
        );
    }
}
