<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Tests\TestCase;

class MemberTest extends TestCase
{
    private function createCooperative(string $code = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'HTX_' . Str::random(5),
            'legal_name' => 'HTX Thử Nghiệm Xã Viên',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop, array $permissionCodes): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_MEMBER_TEST_' . Str::random(4),
            'name' => 'Member Test Role',
        ]);

        foreach ($permissionCodes as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm ' . $pCode, 'module' => 'Member']
            );
            $role->permissions()->attach($permission->id);
        }

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'member_user_' . Str::random(5),
            'email' => 'member_user_' . Str::random(5) . '@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Quản Lý Xã Viên',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    public function test_create_member_successfully(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.CREATE', 'MEMBER.READ']);

        $payload = [
            'member_code' => 'XV001',
            'identity_information' => [
                'full_name' => 'Nguyễn Văn Xã Viên',
                'citizen_id' => '012345678901',
                'phone_number' => '0901234567',
                'address' => 'Xã Tân An, Huyện Thanh Hà',
            ],
            'member_type' => 'OFFICIAL',
            'admission_date' => '2026-01-15',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/members', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.member_code', 'XV001');
        $response->assertJsonPath('data.status', 'DRAFT');

        $this->assertDatabaseHas('members', [
            'cooperative_id' => $coop->id,
            'member_code' => 'XV001',
            'status' => 'DRAFT',
        ]);

        // Audit log check
        $this->assertDatabaseHas('audit_events', [
            'action' => 'MEMBER_CREATED',
            'cooperative_id' => $coop->id,
        ]);
    }

    public function test_create_member_fails_when_member_code_duplicated(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.CREATE']);

        MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_DUP',
            'identity_information' => ['full_name' => 'Xã Viên Cũ'],
            'member_type' => 'OFFICIAL',
            'status' => 'ACTIVE',
        ]);

        $payload = [
            'member_code' => 'XV_DUP',
            'identity_information' => ['full_name' => 'Xã Viên Trùng'],
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/members', $payload);

        $response->assertStatus(409);
        $response->assertJsonPath('error.code', 'DUPLICATE_MEMBER_CODE');
    }

    public function test_list_members_supports_pagination_filter_search(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.READ']);

        MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_SEARCH_1',
            'identity_information' => ['full_name' => 'Trần Thị Mai', 'phone_number' => '0988111222'],
            'member_type' => 'OFFICIAL',
            'status' => 'ACTIVE',
        ]);

        MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_SEARCH_2',
            'identity_information' => ['full_name' => 'Lê Văn Tuấn', 'phone_number' => '0977333444'],
            'member_type' => 'ASSOCIATED',
            'status' => 'DRAFT',
        ]);

        // Filter search by name
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/members?search=Trần%20Thị%20Mai&status=ACTIVE');

        $response->assertStatus(200);
        $response->assertJsonPath('meta.total', 1);
        $response->assertJsonPath('data.0.member_code', 'XV_SEARCH_1');
    }

    public function test_update_member_successfully(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.READ', 'MEMBER.UPDATE']);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_UPDATE',
            'identity_information' => ['full_name' => 'Nguyễn Văn Ban Đầu'],
            'member_type' => 'OFFICIAL',
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($user, 'sanctum')->patchJson("/api/v1/members/{$member->id}", [
            'identity_information' => ['full_name' => 'Nguyễn Văn Đã Cập Nhật', 'address' => 'Thôn 1'],
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.identity_information.full_name', 'Nguyễn Văn Đã Cập Nhật');

        $this->assertDatabaseHas('audit_events', [
            'action' => 'MEMBER_UPDATED',
            'entity_id' => $member->id,
        ]);
    }

    public function test_approve_member_transitions_from_draft_to_active(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.READ', 'MEMBER.UPDATE']);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_DRAFT',
            'identity_information' => ['full_name' => 'Xã Viên Chờ Duyệt'],
            'member_type' => 'OFFICIAL',
            'status' => 'DRAFT',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/members/{$member->id}/approve");

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'ACTIVE');

        $this->assertDatabaseHas('audit_events', [
            'action' => 'MEMBER_APPROVED',
            'entity_id' => $member->id,
        ]);
    }

    public function test_status_transition_rules_and_invalid_transition(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.READ', 'MEMBER.UPDATE']);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_TRANS',
            'identity_information' => ['full_name' => 'Xã Viên Active'],
            'member_type' => 'OFFICIAL',
            'status' => 'ACTIVE',
        ]);

        // Transition ACTIVE -> PENDING_TERMINATION
        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/members/{$member->id}/status-transitions", [
            'target_status' => 'PENDING_TERMINATION',
            'reason' => 'Xin ra khỏi HTX',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'PENDING_TERMINATION');

        // Transition to TERMINATED
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/members/{$member->id}/status-transitions", [
            'target_status' => 'TERMINATED',
            'reason' => 'Hoàn tất chấm dứt',
        ]);

        // Invalid transition TERMINATED -> ACTIVE (Not allowed by domain rules)
        $invalidResponse = $this->actingAs($user, 'sanctum')->postJson("/api/v1/members/{$member->id}/status-transitions", [
            'target_status' => 'ACTIVE',
        ]);

        $invalidResponse->assertStatus(400);
        $invalidResponse->assertJsonPath('error.code', 'ERR_MEMBER_INVALID_STATUS_TRANSITION');
    }

    public function test_member_credit_limit_and_soft_delete(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.CREATE', 'MEMBER.READ', 'MEMBER.UPDATE', 'MEMBER.DELETE']);

        // Create with credit_limit
        $createRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/members', [
            'member_code' => 'XV_CREDIT_01',
            'identity_information' => ['full_name' => 'Nguyễn Văn Tín Dụng'],
            'member_type' => 'OFFICIAL',
            'credit_limit' => 50000000,
        ]);
        $createRes->assertStatus(201);
        $createRes->assertJsonPath('data.credit_limit', 50000000);

        $memberId = $createRes->json('data.id');

        // Update credit_limit
        $updateRes = $this->actingAs($user, 'sanctum')->patchJson("/api/v1/members/{$memberId}", [
            'credit_limit' => 100000000,
        ]);
        $updateRes->assertStatus(200);
        $updateRes->assertJsonPath('data.credit_limit', 100000000);

        // Soft delete
        $deleteRes = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/members/{$memberId}");
        $deleteRes->assertStatus(200);

        $deletedMember = MemberModel::withTrashed()->find($memberId);
        $this->assertNotNull($deletedMember->deleted_at);
    }

    public function test_cross_tenant_isolation_prevents_viewing_other_cooperative_members(): void
    {
        $coopA = $this->createCooperative('HTX_AAA');
        $coopB = $this->createCooperative('HTX_BBB');

        $userA = $this->createUserWithPermissions($coopA, ['MEMBER.READ']);

        $memberB = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopB->id,
            'member_code' => 'XV_COOP_B',
            'identity_information' => ['full_name' => 'Xã Viên HTX B'],
            'member_type' => 'OFFICIAL',
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($userA, 'sanctum')->getJson("/api/v1/members/{$memberB->id}");

        $response->assertStatus(404);
        $response->assertJsonPath('error.code', 'MEMBER_NOT_FOUND');
    }

    public function test_unauthorized_user_without_permission_cannot_create_member(): void
    {
        $coop = $this->createCooperative();
        $userNoPerm = $this->createUserWithPermissions($coop, ['AGRICULTURE.READ']); // No MEMBER.CREATE

        $payload = [
            'member_code' => 'XV_UNAUTH',
            'identity_information' => ['full_name' => 'Xã Viên Thất Bại'],
        ];

        $response = $this->actingAs($userNoPerm, 'sanctum')->postJson('/api/v1/members', $payload);

        $response->assertStatus(403);
        $response->assertJsonPath('error.code', 'FORBIDDEN');
    }
}
