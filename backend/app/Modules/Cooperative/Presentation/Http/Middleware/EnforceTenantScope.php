<?php

namespace Modules\Cooperative\Presentation\Http\Middleware;

use App\Shared\Application\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Symfony\Component\HttpFoundation\Response;

class EnforceTenantScope
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // Global roles (SYSTEM_ADMIN, CRITERIA_ADMIN, AUTHORITY, AUDITOR) can pass target tenant header or default
            if ($user->hasRole('SYSTEM_ADMIN') || $user->hasRole('CRITERIA_ADMIN') || $user->hasRole('AUTHORITY') || $user->hasRole('AUDITOR')) {
                $tenantId = $request->header('X-Cooperative-ID') ?: $user->cooperative_id;
                $this->tenantContext->setCooperativeId($tenantId);
                return $next($request);
            }

            // Normal HTX roles MUST have a valid cooperative_id
            $cooperativeId = $user->cooperative_id;

            if (empty($cooperativeId)) {
                $this->auditService->log(
                    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
                    entityType: 'Cooperative',
                    entityId: null,
                    after: ['reason' => 'User has no assigned cooperative_id']
                );

                return ApiResponse::error(
                    code: 'TENANT_SCOPE_REQUIRED',
                    message: 'Tài khoản người dùng chưa được gán vào Hợp tác xã nào',
                    status: 403
                );
            }

            // Cross-tenant validation: If request specifies a tenant header, ensure it matches user's assigned cooperative
            $requestedTenantId = $request->header('X-Cooperative-ID');
            if (!empty($requestedTenantId) && $requestedTenantId !== $cooperativeId) {
                $this->auditService->log(
                    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
                    entityType: 'Cooperative',
                    entityId: $requestedTenantId,
                    before: ['user_assigned_coop' => $cooperativeId],
                    after: ['attempted_target_coop' => $requestedTenantId]
                );

                return ApiResponse::error(
                    code: 'UNAUTHORIZED_TENANT_ACCESS',
                    message: 'Bạn không có quyền truy cập dữ liệu của Hợp tác xã khác',
                    status: 403
                );
            }

            $this->tenantContext->setCooperativeId($cooperativeId);
        }

        return $next($request);
    }
}
