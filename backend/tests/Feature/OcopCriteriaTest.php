<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaGroupModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriterionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Tests\TestCase;

class OcopCriteriaTest extends TestCase
{
    private function createAuthUser(string $roleName = 'CRITERIA_ADMIN'): array
    {
        $cooperative = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_OCOP_'.Str::random(4),
            'legal_name' => 'Hợp tác xã OCOP Thử Nghiệm',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::firstOrCreate(
            ['name' => $roleName],
            ['id' => (string) Str::uuid(), 'code' => $roleName, 'display_name' => $roleName, 'description' => $roleName]
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'admin_'.Str::random(4),
            'email' => 'admin_'.Str::random(4).'@ocop.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Quản trị Bộ Tiêu chí',
            'cooperative_id' => $cooperative->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);
        $token = $user->createToken('test_token')->plainTextToken;

        return [
            'user' => $user,
            'cooperative' => $cooperative,
            'token' => $token,
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ],
        ];
    }

    public function test_get_council_levels_returns_success_list(): void
    {
        $auth = $this->createAuthUser();

        $response = $this->withHeaders($auth['headers'])
            ->getJson('/api/v1/ocop/council-levels');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_create_criteria_version_creates_draft_version(): void
    {
        $auth = $this->createAuthUser();
        $code = 'OCOP-2026-V1-'.Str::random(4);

        $response = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/criteria-versions', [
                'version_code' => $code,
                'name' => 'Bộ tiêu chí OCOP Nông nghiệp 2026',
                'effective_from' => '2026-01-01',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.version_code', $code);
        $response->assertJsonPath('data.status', 'DRAFT');

        $this->assertDatabaseHas('criteria_versions', [
            'version_code' => $code,
            'status' => 'DRAFT',
        ]);
    }

    public function test_create_criteria_tree_groups_criteria_and_indicators(): void
    {
        $auth = $this->createAuthUser();
        $code = 'OCOP-TREE-'.Str::random(4);

        $versionResp = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/criteria-versions', [
                'version_code' => $code,
                'name' => 'Bộ tiêu chí Cây trồng 2026',
            ]);
        $versionId = $versionResp->json('data.id');

        // Create Group
        $groupResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/criteria-versions/{$versionId}/groups", [
                'code' => 'N1',
                'name' => 'Nhóm 1: Sản phẩm và sức mạnh cộng đồng',
                'display_order' => 1,
            ]);
        $groupResp->assertStatus(201);
        $groupId = $groupResp->json('data.id');

        // Create Criterion
        $criterionResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/criteria-groups/{$groupId}/criteria", [
                'code' => 'TC01',
                'name' => 'Tiêu chí 1: Nguồn gốc nguyên liệu local',
                'max_score' => 40.0,
                'mandatory' => true,
            ]);
        $criterionResp->assertStatus(201);
        $criterionId = $criterionResp->json('data.id');

        // Create Indicator
        $indicatorResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/criteria/{$criterionId}/indicators", [
                'code' => 'CT01.1',
                'name' => 'Chỉ tiêu 1.1: Tỷ lệ nguyên liệu tại chỗ > 80%',
                'max_score' => 40.0,
                'mandatory' => true,
            ]);
        $indicatorResp->assertStatus(201);
        $indicatorResp->assertJsonPath('data.max_score', 40);
    }

    public function test_publish_version_fails_when_total_score_is_not_100(): void
    {
        $auth = $this->createAuthUser();
        $code = 'OCOP-ERR-SCORE-'.Str::random(4);

        $versionResp = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/criteria-versions', [
                'version_code' => $code,
                'name' => 'Bộ tiêu chí Điểm sai',
            ]);
        $versionId = $versionResp->json('data.id');

        $group = CriteriaGroupModel::create([
            'id' => (string) Str::uuid(),
            'criteria_version_id' => $versionId,
            'code' => 'G1',
            'name' => 'Nhóm 1',
        ]);

        $criterion = CriterionModel::create([
            'id' => (string) Str::uuid(),
            'criteria_group_id' => $group->id,
            'code' => 'C1',
            'name' => 'Tiêu chí 1',
            'max_score' => 50.0,
        ]);

        IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion->id,
            'code' => 'I1',
            'name' => 'Chỉ tiêu 1 (chỉ có 50 điểm)',
            'max_score' => 50.0,
        ]);

        // Publish attempt -> Should fail with TOTAL_SCORE_INVALID
        $publishResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/criteria-versions/{$versionId}/publish");

        $publishResp->assertStatus(400);
        $publishResp->assertJsonPath('error.code', 'TOTAL_SCORE_INVALID');
    }

    public function test_publish_version_succeeds_when_total_score_equals_100(): void
    {
        $auth = $this->createAuthUser();
        $code = 'OCOP-VALID-100-'.Str::random(4);

        $versionResp = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/criteria-versions', [
                'version_code' => $code,
                'name' => 'Bộ tiêu chí Chuẩn 100 điểm',
            ]);
        $versionId = $versionResp->json('data.id');

        $group = CriteriaGroupModel::create([
            'id' => (string) Str::uuid(),
            'criteria_version_id' => $versionId,
            'code' => 'G1',
            'name' => 'Nhóm 1',
        ]);

        $criterion1 = CriterionModel::create([
            'id' => (string) Str::uuid(),
            'criteria_group_id' => $group->id,
            'code' => 'C1',
            'name' => 'Tiêu chí 1 (60d)',
            'max_score' => 60.0,
        ]);

        IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion1->id,
            'code' => 'I1.1',
            'name' => 'Chỉ tiêu 1.1',
            'max_score' => 60.0,
        ]);

        $criterion2 = CriterionModel::create([
            'id' => (string) Str::uuid(),
            'criteria_group_id' => $group->id,
            'code' => 'C2',
            'name' => 'Tiêu chí 2 (40d)',
            'max_score' => 40.0,
        ]);

        IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion2->id,
            'code' => 'I2.1',
            'name' => 'Chỉ tiêu 2.1',
            'max_score' => 40.0,
        ]);

        // Publish attempt -> Should succeed (60 + 40 = 100)
        $publishResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/criteria-versions/{$versionId}/publish");

        $publishResp->assertStatus(200);
        $publishResp->assertJsonPath('success', true);
        $publishResp->assertJsonPath('data.status', 'PUBLISHED');

        // Audit Log verification
        $this->assertDatabaseHas('audit_events', [
            'action' => 'CRITERIA_VERSION_PUBLISHED',
            'entity_id' => $versionId,
        ]);
    }

    public function test_published_criteria_version_is_immutable(): void
    {
        $auth = $this->createAuthUser();
        $code = 'OCOP-IMMUTABLE-'.Str::random(4);

        $version = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => $code,
            'name' => 'Bộ tiêu chí Đã Đóng Đóng Băng',
            'status' => 'PUBLISHED',
        ]);

        // Attempting to update version metadata -> Fails
        $updateResp = $this->withHeaders($auth['headers'])
            ->patchJson("/api/v1/ocop/criteria-versions/{$version->id}", [
                'name' => 'Tên Mới Chỉnh Sửa',
            ]);

        $updateResp->assertStatus(400);
        $updateResp->assertJsonPath('error.code', 'CRITERIA_VERSION_IMMUTABLE');

        // Attempting to add a new group under published version -> Fails
        $addGroupResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/criteria-versions/{$version->id}/groups", [
                'code' => 'G_NEW',
                'name' => 'Nhóm mới',
            ]);

        $addGroupResp->assertStatus(400);
        $addGroupResp->assertJsonPath('error.code', 'CRITERIA_VERSION_IMMUTABLE');
    }
}
