<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Audit\Infrastructure\Persistence\Models\AuditLogModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Tests\TestCase;

class SystemSettingTest extends TestCase
{
    private CooperativeModel $cooperative;
    private UserModel $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cooperative = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX-TEST-01',
            'legal_name' => 'HTX Nông Nghiệp Thử Nghiệm',
            'display_name' => 'HTX Thử Nghiệm',
            'status' => 'ACTIVE',
            'contact_information' => [
                'address' => 'Số 10 Đường Hoa Hồng, TP. Đà Lạt',
                'email' => 'htxtest@example.com',
                'phone_number' => '0901234567',
            ],
            'legal_information' => [
                'system_settings' => [
                    'min_capital_contribution' => 10000000,
                    'service_fee_rate' => 5,
                    'profit_share_member_rate' => 70,
                    'profit_share_coop_rate' => 30,
                    'enable_2fa' => false,
                    'idle_timeout_minutes' => 30,
                ],
            ],
        ]);

        $role = RoleModel::firstOrCreate(
            ['code' => 'SYSTEM_ADMIN'],
            ['id' => (string) Str::uuid(), 'name' => 'Quản trị viên kỹ thuật hệ thống']
        );

        $this->user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'sys_admin_test',
            'email' => 'admin@htxtest.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Nguyễn Quản Trị',
            'cooperative_id' => $this->cooperative->id,
            'status' => 'ACTIVE',
        ]);

        $this->user->roles()->attach($role->id);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/system-settings');
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_get_system_settings(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->withHeader('X-Tenant-Id', $this->cooperative->id)
            ->getJson('/api/v1/system-settings');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'system_name',
                'managing_unit',
                'default_language',
                'timezone',
                'address',
                'date_format',
                'support_email',
                'support_phone',
                'system_version',
                'enable_2fa',
                'limit_failed_login',
                'auto_logout_idle',
                'idle_timeout_minutes',
                'min_capital_contribution',
                'service_fee_rate',
                'profit_share_member_rate',
                'profit_share_coop_rate',
            ],
        ]);

        $this->assertEquals('HTX Thử Nghiệm', $response->json('data.system_name'));
        $this->assertEquals('HTX Nông Nghiệp Thử Nghiệm', $response->json('data.managing_unit'));
        $this->assertEquals('Số 10 Đường Hoa Hồng, TP. Đà Lạt', $response->json('data.address'));
        $this->assertEquals('htxtest@example.com', $response->json('data.support_email'));
        $this->assertEquals(70, $response->json('data.profit_share_member_rate'));
    }

    public function test_authenticated_user_can_update_system_settings_and_persist_to_database(): void
    {
        $updatePayload = [
            'system_name' => 'HTX Nông Nghiệp Công Nghệ Cao Đà Lạt',
            'managing_unit' => 'Hợp tác xã Nông Nghiệp Công Nghệ Cao Đà Lạt',
            'address' => '123 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt',
            'support_email' => 'contact@htxdalat.vn',
            'support_phone' => '0912345678',
            'enable_2fa' => true,
            'limit_failed_login' => true,
            'auto_logout_idle' => true,
            'idle_timeout_minutes' => 60,
            'min_capital_contribution' => 25000000,
            'service_fee_rate' => 3.5,
            'profit_share_member_rate' => 80,
            'profit_share_coop_rate' => 20,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->withHeader('X-Tenant-Id', $this->cooperative->id)
            ->putJson('/api/v1/system-settings', $updatePayload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.system_name', 'HTX Nông Nghiệp Công Nghệ Cao Đà Lạt');
        $response->assertJsonPath('data.managing_unit', 'Hợp tác xã Nông Nghiệp Công Nghệ Cao Đà Lạt');
        $response->assertJsonPath('data.address', '123 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt');
        $response->assertJsonPath('data.support_email', 'contact@htxdalat.vn');
        $response->assertJsonPath('data.support_phone', '0912345678');
        $response->assertJsonPath('data.enable_2fa', true);
        $response->assertJsonPath('data.idle_timeout_minutes', 60);
        $response->assertJsonPath('data.min_capital_contribution', 25000000);
        $response->assertJsonPath('data.service_fee_rate', 3.5);
        $response->assertJsonPath('data.profit_share_member_rate', 80);
        $response->assertJsonPath('data.profit_share_coop_rate', 20);

        // Verify database persistence on CooperativeModel
        $freshCoop = CooperativeModel::find($this->cooperative->id);
        $this->assertEquals('Hợp tác xã Nông Nghiệp Công Nghệ Cao Đà Lạt', $freshCoop->legal_name);
        $this->assertEquals('HTX Nông Nghiệp Công Nghệ Cao Đà Lạt', $freshCoop->display_name);
        $this->assertEquals('123 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt', $freshCoop->contact_information['address']);
        $this->assertEquals('contact@htxdalat.vn', $freshCoop->contact_information['email']);
        $this->assertEquals(25000000, $freshCoop->legal_information['system_settings']['min_capital_contribution']);

        // Verify subsequent GET returns the persisted data
        $getAfterUpdate = $this->actingAs($this->user, 'sanctum')
            ->withHeader('X-Tenant-Id', $this->cooperative->id)
            ->getJson('/api/v1/system-settings');

        $getAfterUpdate->assertStatus(200);
        $this->assertEquals('HTX Nông Nghiệp Công Nghệ Cao Đà Lạt', $getAfterUpdate->json('data.system_name'));
        $this->assertEquals('123 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt', $getAfterUpdate->json('data.address'));
        $this->assertEquals(80, $getAfterUpdate->json('data.profit_share_member_rate'));
    }

    public function test_update_system_settings_validation_errors(): void
    {
        // 1. Invalid email
        $invalidEmailResponse = $this->actingAs($this->user, 'sanctum')
            ->withHeader('X-Tenant-Id', $this->cooperative->id)
            ->putJson('/api/v1/system-settings', [
                'support_email' => 'not-an-email-address',
            ]);
        $invalidEmailResponse->assertStatus(422);

        // 2. Service fee rate exceeding 100%
        $invalidRateResponse = $this->actingAs($this->user, 'sanctum')
            ->withHeader('X-Tenant-Id', $this->cooperative->id)
            ->putJson('/api/v1/system-settings', [
                'service_fee_rate' => 150,
            ]);
        $invalidRateResponse->assertStatus(422);

        // 3. Idle timeout less than 5 minutes
        $invalidTimeoutResponse = $this->actingAs($this->user, 'sanctum')
            ->withHeader('X-Tenant-Id', $this->cooperative->id)
            ->putJson('/api/v1/system-settings', [
                'idle_timeout_minutes' => 2,
            ]);
        $invalidTimeoutResponse->assertStatus(422);
    }

    public function test_update_system_settings_generates_audit_log(): void
    {
        $this->actingAs($this->user, 'sanctum')
            ->withHeader('X-Tenant-Id', $this->cooperative->id)
            ->putJson('/api/v1/system-settings', [
                'system_name' => 'HTX Kiểm Toán Hệ Thống',
                'service_fee_rate' => 4.2,
            ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'SYSTEM_SETTINGS_UPDATED',
            'entity_type' => 'SystemSetting',
            'entity_id' => $this->cooperative->id,
        ]);
    }
}
