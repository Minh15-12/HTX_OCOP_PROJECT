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
            $cooperativeId = $user->cooperative_id ?: 'a2bcb702-871d-4ad6-813d-c50726dd3a47';

            // Global/Admin roles can access any tenant passed in header or default to assigned coop
            if ($user->hasRole('SYSTEM_ADMIN') || $user->hasRole('CRITERIA_ADMIN') || $user->hasRole('AUTHORITY') || $user->hasRole('AUDITOR') || $user->hasRole('HTX_OWNER')) {
                $tenantId = $request->header('X-Cooperative-ID') ?: $cooperativeId;
                $this->tenantContext->setCooperativeId($tenantId);
                return $next($request);
            }

            // Cross-tenant validation: Only reject if user explicitly tries to query a different specific UUID tenant
            $requestedTenantId = $request->header('X-Cooperative-ID');
            if (!empty($requestedTenantId) && !empty($cooperativeId) && $requestedTenantId !== $cooperativeId && strlen($requestedTenantId) === 36) {
                return ApiResponse::error(
                    code: 'UNAUTHORIZED_TENANT_ACCESS',
                    message: 'Bạn không có quyền truy cập dữ liệu của Hợp tác xã khác',
                    status: 403
                );
            }

            $this->tenantContext->setCooperativeId($cooperativeId);
        } else {
            $tenantId = $request->header('X-Cooperative-ID') ?: 'a2bcb702-871d-4ad6-813d-c50726dd3a47';
            $this->tenantContext->setCooperativeId($tenantId);
        }

        return $next($request);
    }
}
