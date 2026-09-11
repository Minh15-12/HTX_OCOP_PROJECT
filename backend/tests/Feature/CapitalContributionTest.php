<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Tests\TestCase;

class CapitalContributionTest extends TestCase
{
    private function createCooperative(string $code = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'HTX_' . Str::random(5),
            'legal_name' => 'HTX Thử Nghiệm Góp Vốn',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop, array $permissionCodes): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_CAPITAL_TEST_' . Str::random(4),
            'name' => 'Capital Test Role',
        ]);

        foreach ($permissionCodes as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm ' . $pCode, 'module' => 'Finance']
            );
            $role->permissions()->attach($permission->id);
        }

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'cap_user_' . Str::random(5),
            'email' => 'cap_user_' . Str::random(5) . '@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Kế Toán Góp Vốn',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    public function test_create_capital_contribution_successfully(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.READ', 'MEMBER.UPDATE']);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_CAP_1',
            'identity_information' => ['full_name' => 'Nguyễn Văn Góp Vốn'],
            'member_type' => 'OFFICIAL',
            'status' => 'ACTIVE',
        ]);

        $payload = [
            'contribution_type' => 'INITIAL',
            'amount' => 50000000.00, // 50 triệu VNĐ
            'transaction_date' => '2026-02-01',
            'value_description' => 'Góp vốn điều lệ ban đầu',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/members/{$member->id}/capital-contributions", $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.amount', 50000000);
        $response->assertJsonPath('data.contribution_type', 'INITIAL');

        $this->assertDatabaseHas('capital_contributions', [
            'member_id' => $member->id,
            'amount' => 50000000.00,
            'contribution_type' => 'INITIAL',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'CAPITAL_CONTRIBUTION_CREATED',
            'cooperative_id' => $coop->id,
        ]);
    }

    public function test_create_capital_contribution_fails_when_amount_is_zero_or_negative(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.UPDATE']);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_CAP_2',
            'identity_information' => ['full_name' => 'Lê Văn B'],
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/members/{$member->id}/capital-contributions", [
                'contribution_type' => 'ADDITIONAL',
                'amount' => -1000.00,
                'transaction_date' => '2026-02-01',
            ]);

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'VALIDATION_FAILED');
    }

    public function test_list_member_contributions_and_aggregation(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['MEMBER.READ']);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_CAP_3',
            'identity_information' => ['full_name' => 'Trần Văn C'],
            'status' => 'ACTIVE',
        ]);

        CapitalContributionModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $member->id,
            'contribution_type' => 'INITIAL',
            'amount' => 20000000.00,
            'transaction_date' => '2026-01-10',
            'status' => 'PAID',
        ]);

        CapitalContributionModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $member->id,
            'contribution_type' => 'ADDITIONAL',
            'amount' => 15000000.00,
            'transaction_date' => '2026-02-10',
            'status' => 'PAID',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/members/{$member->id}/capital-contributions");

        $response->assertStatus(200);
        $response->assertJsonPath('meta.total', 2);
        $response->assertJsonPath('meta.total_contribution_amount', 35000000);
    }

    public function test_cross_tenant_isolation_prevents_viewing_contributions_of_other_cooperative(): void
    {
        $coopA = $this->createCooperative('HTX_CAP_A');
        $coopB = $this->createCooperative('HTX_CAP_B');

        $userA = $this->createUserWithPermissions($coopA, ['MEMBER.READ']);

        $memberB = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopB->id,
            'member_code' => 'XV_COOP_B',
            'identity_information' => ['full_name' => 'Xã Viên HTX B'],
            'status' => 'ACTIVE',
        ]);

        $contribB = CapitalContributionModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $memberB->id,
            'contribution_type' => 'INITIAL',
            'amount' => 10000000.00,
            'transaction_date' => '2026-01-01',
            'status' => 'PAID',
        ]);

        // Attempting to access contribution of HTX B as User of HTX A
        $response = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/capital-contributions/{$contribB->id}");

        $response->assertStatus(403);
        $response->assertJsonPath('error.code', 'UNAUTHORIZED_TENANT_ACCESS');
    }
}
