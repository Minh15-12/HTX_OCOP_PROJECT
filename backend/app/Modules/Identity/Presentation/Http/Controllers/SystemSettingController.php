<?php

namespace Modules\Identity\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;

class SystemSettingController extends BaseController
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function show(): JsonResponse
    {
        $coop = null;
        if ($this->tenantContext->hasTenant()) {
            $coop = CooperativeModel::find($this->tenantContext->getCooperativeId());
        }
        if (!$coop) {
            $coop = CooperativeModel::first();
        }

        $data = [
            'system_name' => 'HTX Nông nghiệp Xanh Phú Thịnh',
            'managing_unit' => $coop?->legal_name ?? 'Hợp tác xã Nông nghiệp Xanh Phú Thịnh',
            'default_language' => 'Tiếng Việt',
            'timezone' => '(GMT+07:00) Asia/Ho_Chi_Minh',
            'address' => $coop?->address ?? 'Thôn 2, xã Mê Linh, huyện Lâm Hà, tỉnh Lâm Đồng',
            'date_format' => 'dd/mm/yyyy',
            'support_email' => $coop?->email ?? 'htxphuthinh@gmail.com',
            'support_phone' => $coop?->phone_number ?? '0987 654 321',
            'system_version' => 'v1.0.0',
            'logo_url' => null,
            // Cài đặt bảo mật
            'enable_2fa' => false,
            'limit_failed_login' => true,
            'auto_logout_idle' => true,
            'idle_timeout_minutes' => 30,
            // Cài đặt nghiệp vụ
            'min_capital_contribution' => 10000000,
            'service_fee_rate' => 5,
            'profit_share_member_rate' => 70,
            'profit_share_coop_rate' => 30,
        ];

        return ApiResponse::success(
            data: $data,
            message: 'Lấy cấu hình hệ thống thành công'
        );
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'system_name' => 'nullable|string|max:255',
            'managing_unit' => 'nullable|string|max:255',
            'default_language' => 'nullable|string|max:50',
            'timezone' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'date_format' => 'nullable|string|max:20',
            'support_email' => 'nullable|email|max:255',
            'support_phone' => 'nullable|string|max:50',
            'enable_2fa' => 'nullable|boolean',
            'limit_failed_login' => 'nullable|boolean',
            'auto_logout_idle' => 'nullable|boolean',
            'idle_timeout_minutes' => 'nullable|integer|min:5|max:480',
            'min_capital_contribution' => 'nullable|numeric|min:0',
            'service_fee_rate' => 'nullable|numeric|min:0|max:100',
            'profit_share_member_rate' => 'nullable|numeric|min:0|max:100',
            'profit_share_coop_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($this->tenantContext->hasTenant()) {
            $coop = CooperativeModel::find($this->tenantContext->getCooperativeId());
            if ($coop) {
                $coop->update([
                    'legal_name' => $validated['managing_unit'] ?? $coop->legal_name,
                    'address' => $validated['address'] ?? $coop->address,
                    'email' => $validated['support_email'] ?? $coop->email,
                    'phone_number' => $validated['support_phone'] ?? $coop->phone_number,
                ]);
            }
        }

        $this->auditService->log(
            action: 'SYSTEM_SETTINGS_UPDATED',
            entityType: 'SystemSetting',
            entityId: null,
            after: $validated
        );

        return ApiResponse::success(
            data: $validated,
            message: 'Lưu cài đặt hệ thống thành công'
        );
    }
}
