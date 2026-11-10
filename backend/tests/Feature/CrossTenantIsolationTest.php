<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Tests\TestCase;

class CrossTenantIsolationTest extends TestCase
{
    public function test_user_can_access_own_cooperative_data(): void
    {
        $coop = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_A_'.Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp A',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'HTX_OWNER_'.Str::random(4),
            'name' => 'HTX Owner',
        ]);

        $perm = PermissionModel::firstOrCreate(
            ['code' => 'COOPERATIVE.READ'],
            ['id' => (string) Str::uuid(), 'name' => 'COOPERATIVE.READ', 'module' => 'Cooperative']
        );
        $role->permissions()->attach($perm->id);

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'user_coop_a_'.Str::random(4),
            'email' => 'user_a_'.Str::random(4).'@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Chủ HTX A',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);
        $user->roles()->attach($role->id);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/cooperatives/my-cooperative');

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $coop->id);
    }

    public function test_user_attempting_cross_tenant_access_receives_403_forbidden(): void
    {
        $coopA = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_A_'.Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp A',
            'status' => 'ACTIVE',
        ]);

        $coopB = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_B_'.Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp B',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'HTX_STAFF_'.Str::random(4),
            'name' => 'HTX Staff',
        ]);

        $perm = PermissionModel::firstOrCreate(
            ['code' => 'COOPERATIVE.READ'],
            ['id' => (string) Str::uuid(), 'name' => 'COOPERATIVE.READ', 'module' => 'Cooperative']
        );
        $role->permissions()->attach($perm->id);

        $userA = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'user_a_'.Str::random(4),
            'email' => 'user_a_'.Str::random(4).'@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Nhân viên HTX A',
            'cooperative_id' => $coopA->id,
            'status' => 'ACTIVE',
        ]);
        $userA->roles()->attach($role->id);

        // Attempting to send X-Cooperative-ID for Coop B while assigned to Coop A
        $response = $this->actingAs($userA, 'sanctum')
            ->withHeaders(['X-Cooperative-ID' => $coopB->id])
            ->getJson('/api/v1/cooperatives/my-cooperative');

        $response->assertStatus(403);
        $response->assertJsonPath('error.code', 'UNAUTHORIZED_TENANT_ACCESS');
    }
}
