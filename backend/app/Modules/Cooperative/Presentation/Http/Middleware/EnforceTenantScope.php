<?php

namespace Modules\Cooperative\Presentation\Http\Middleware;

use App\Shared\Application\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Symfony\Component\HttpFoundation\Response;

class EnforceTenantScope
{
    /**
     * Platform-wide administrative or regulatory oversight roles permitted
     * to switch tenant context to inspect specific cooperatives.
     */
    private const GLOBAL_ADMIN_ROLES = [
        'SYSTEM_ADMIN',
        'CRITERIA_ADMIN',
        'AUTHORITY',
        'AUDITOR',
    ];

    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $userCoopId = $user->cooperative_id;
            $requestedTenantId = $request->header('X-Cooperative-ID');

            // 1. Check if user possesses a platform-wide oversight/admin role
            $isGlobalAdmin = false;
            foreach (self::GLOBAL_ADMIN_ROLES as $role) {
                if ($user->hasRole($role)) {
                    $isGlobalAdmin = true;
                    break;
                }
            }

            if ($isGlobalAdmin) {
                if (!empty($requestedTenantId)) {
                    // Validate that the requested tenant UUID actually exists
                    if (strlen($requestedTenantId) === 36 && CooperativeModel::where('id', $requestedTenantId)->exists()) {
                        $this->tenantContext->setCooperativeId($requestedTenantId);
                    } else {
                        return ApiResponse::error(
                            code: 'INVALID_TENANT_ID',
                            message: 'Hợp tác xã được yêu cầu không tồn tại hoặc định dạng UUID không hợp lệ',
                            status: 404
                        );
                    }
                } elseif (!empty($userCoopId)) {
                    $this->tenantContext->setCooperativeId($userCoopId);
                } else {
                    $this->tenantContext->setCooperativeId(null);
                }

                return $next($request);
            }

            // 2. Tenant-bound cooperative user (HTX_OWNER, ACCOUNTANT, STOREKEEPER, MEMBER, etc.)
            if (empty($userCoopId)) {
                return ApiResponse::error(
                    code: 'UNASSIGNED_COOPERATIVE_ACCOUNT',
                    message: 'Tài khoản người dùng chưa được gán vào Hợp tác xã hợp lệ',
                    status: 403
                );
            }

            // Strict Tenant Isolation: Block and audit any cross-tenant header tampering
            if (!empty($requestedTenantId) && $requestedTenantId !== $userCoopId) {
                $this->auditService->log(
                    action: 'SECURITY_ALERT_TENANT_TAMPERING',
                    entityType: 'User',
                    entityId: $user->id,
                    before: ['assigned_cooperative_id' => $userCoopId],
                    after: [
                        'requested_cooperative_id' => $requestedTenantId,
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ],
                    actorId: $user->id,
                    cooperativeId: $userCoopId
                );

                return ApiResponse::error(
                    code: 'UNAUTHORIZED_TENANT_ACCESS',
                    message: 'Bạn không có quyền truy cập dữ liệu của Hợp tác xã khác',
                    status: 403
                );
            }

            // Always lock tenant context to user's assigned cooperative
            $this->tenantContext->setCooperativeId($userCoopId);
        } else {
            // Unauthenticated requests have no tenant context
            $this->tenantContext->setCooperativeId(null);
        }

        return $next($request);
    }
}
