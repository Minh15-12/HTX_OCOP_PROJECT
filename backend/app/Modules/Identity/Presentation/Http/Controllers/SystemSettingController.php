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

        $contact = $coop?->contact_information ?? [];
        $legal = $coop?->legal_information ?? [];
        $savedSettings = $legal['system_settings'] ?? [];

        $data = [
            'system_name' => $savedSettings['system_name'] ?? ($coop?->display_name ?? 'HTX Nông nghiệp Xanh Phú Thịnh'),
            'managing_unit' => $savedSettings['managing_unit'] ?? ($coop?->legal_name ?? 'Hợp tác xã Nông nghiệp Xanh Phú Thịnh'),
            'default_language' => $savedSettings['default_language'] ?? 'Tiếng Việt',
            'timezone' => $savedSettings['timezone'] ?? '(GMT+07:00) Asia/Ho_Chi_Minh',
            'address' => $savedSettings['address'] ?? ($contact['address'] ?? 'Thôn 2, xã Mê Linh, huyện Lâm Hà, tỉnh Lâm Đồng'),
            'date_format' => $savedSettings['date_format'] ?? 'dd/mm/yyyy',
            'support_email' => $savedSettings['support_email'] ?? ($contact['email'] ?? 'htxphuthinh@gmail.com'),
            'support_phone' => $savedSettings['support_phone'] ?? ($contact['phone_number'] ?? '0987 654 321'),
            'system_version' => 'v1.0.0',
            'logo_url' => $savedSettings['logo_url'] ?? null,
            // Cài đặt bảo mật
            'enable_2fa' => (bool) ($savedSettings['enable_2fa'] ?? false),
            'limit_failed_login' => (bool) ($savedSettings['limit_failed_login'] ?? true),
            'auto_logout_idle' => (bool) ($savedSettings['auto_logout_idle'] ?? true),
            'idle_timeout_minutes' => (int) ($savedSettings['idle_timeout_minutes'] ?? 30),
            // Cài đặt nghiệp vụ
            'min_capital_contribution' => (float) ($savedSettings['min_capital_contribution'] ?? 10000000),
            'service_fee_rate' => (float) ($savedSettings['service_fee_rate'] ?? 5),
            'profit_share_member_rate' => (float) ($savedSettings['profit_share_member_rate'] ?? 70),
            'profit_share_coop_rate' => (float) ($savedSettings['profit_share_coop_rate'] ?? 30),
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

        $coop = null;
        if ($this->tenantContext->hasTenant()) {
            $coop = CooperativeModel::find($this->tenantContext->getCooperativeId());
        }
        if (!$coop) {
            $coop = CooperativeModel::first();
        }

        if ($coop) {
            $contact = $coop->contact_information ?? [];
            if (isset($validated['address'])) {
                $contact['address'] = $validated['address'];
            }
            if (isset($validated['support_email'])) {
                $contact['email'] = $validated['support_email'];
            }
            if (isset($validated['support_phone'])) {
                $contact['phone_number'] = $validated['support_phone'];
            }

            $legal = $coop->legal_information ?? [];
            $settings = $legal['system_settings'] ?? [];
            $mergedSettings = array_merge($settings, $validated);
            $legal['system_settings'] = $mergedSettings;

            $coop->update([
                'legal_name' => $validated['managing_unit'] ?? $coop->legal_name,
                'display_name' => $validated['system_name'] ?? $coop->display_name,
                'contact_information' => $contact,
                'legal_information' => $legal,
            ]);
        }

        $this->auditService->log(
            action: 'SYSTEM_SETTINGS_UPDATED',
            entityType: 'SystemSetting',
            entityId: $coop?->id,
            after: $validated
        );

        return $this->show();
    }
}
