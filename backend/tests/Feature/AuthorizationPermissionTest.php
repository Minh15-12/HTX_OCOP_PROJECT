<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Tests\TestCase;

class AuthorizationPermissionTest extends TestCase
{
    private function createTestUserWithPermission(string $permissionCode): UserModel
    {
        $cooperative = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_'.Str::random(5),
            'legal_name' => 'HTX Nông Nghiệp Test Authorization',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_'.Str::random(5),
            'name' => 'Custom Test Role',
        ]);

        $permission = PermissionModel::firstOrCreate(
            ['code' => $permissionCode],
            ['id' => (string) Str::uuid(), 'name' => 'Permission '.$permissionCode, 'module' => 'Test']
        );

        $role->permissions()->attach($permission->id);

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'auth_user_'.Str::random(5),
            'email' => 'auth_user_'.Str::random(5).'@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'User With Permission',
            'cooperative_id' => $cooperative->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    public function test_authorized_user_with_permission_can_access_users_endpoint(): void
    {
        $user = $this->createTestUserWithPermission('USER.READ');

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/users');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
    }

    public function test_unauthorized_user_without_permission_receives_403_forbidden(): void
    {
        $user = $this->createTestUserWithPermission('MEMBER.READ'); // Does NOT have USER.READ

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/users');

        $response->assertStatus(403);
        $response->assertJsonPath('error.code', 'FORBIDDEN');
    }

    public function test_system_admin_cannot_auto_approve_business_decision_due_to_sod(): void
    {
        $admin = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'sysadmin_'.Str::random(4),
            'email' => 'sysadmin_'.Str::random(4).'@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'System Administrator',
            'status' => 'ACTIVE',
        ]);

        $adminRole = RoleModel::firstOrCreate(
            ['code' => 'SYSTEM_ADMIN'],
            ['id' => (string) Str::uuid(), 'name' => 'Quản trị viên kỹ thuật hệ thống']
        );

        $admin->roles()->attach($adminRole->id);

        $this->actingAs($admin, 'sanctum');

        // SYSTEM_ADMIN gets technical permissions
        $this->assertTrue(Gate::allows('USER.READ'));
        $this->assertTrue(Gate::allows('ROLE.MANAGE'));

        // SYSTEM_ADMIN does NOT get automatic business approval permissions (SoD Rule)
        $this->assertFalse(Gate::allows('OCOP_DECISION.APPROVE'));
    }
}
