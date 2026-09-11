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
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class OcopApplicationTest extends TestCase
{
    private function createAuthUser(?CooperativeModel $cooperative = null, string $roleName = 'COOP_ADMIN'): array
    {
        $cooperative = $cooperative ?: CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_' . Str::random(5),
            'legal_name' => 'HTX Nông Nghiệp Thử Nghiệm OCOP',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::firstOrCreate(
            ['name' => $roleName],
            ['id' => (string) Str::uuid(), 'display_name' => $roleName, 'description' => $roleName]
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'user_' . Str::random(4),
            'email' => 'user_' . Str::random(4) . '@htx.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Nguyễn Văn Quản Lý',
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

    private function createPublishedCriteriaVersion(): CriteriaVersionModel
    {
        $version = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => 'OCOP-TEST-' . Str::random(4),
            'name' => 'Bộ tiêu chí OCOP Thử Nghiệm 100D',
            'status' => 'PUBLISHED',
        ]);

        $group = CriteriaGroupModel::create([
            'id' => (string) Str::uuid(),
            'criteria_version_id' => $version->id,
            'code' => 'G1',
            'name' => 'Nhóm 1',
        ]);

        $criterion = CriterionModel::create([
            'id' => (string) Str::uuid(),
            'criteria_group_id' => $group->id,
            'code' => 'C1',
            'name' => 'Tiêu chí 1',
            'max_score' => 100.0,
        ]);

        IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion->id,
            'code' => 'I1.1',
            'name' => 'Chỉ tiêu 1.1',
            'max_score' => 60.0,
        ]);

        IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion->id,
            'code' => 'I1.2',
            'name' => 'Chỉ tiêu 1.2',
            'max_score' => 40.0,
        ]);

        return $version;
    }

    private function createProduct(string $cooperativeId): ProductModel
    {
        return ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperativeId,
            'code' => 'PROD-' . Str::random(4),
            'name' => 'Gạo Nếp Nương OCOP',
            'category' => 'FOOD',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);
    }

    public function test_create_ocop_application_success(): void
    {
        $auth = $this->createAuthUser();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = $this->createPublishedCriteriaVersion();

        $response = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/applications', [
                'product_id' => $product->id,
                'criteria_version_id' => $version->id,
                'application_type' => 'NEW',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.status', 'DRAFT');

        $this->assertDatabaseHas('ocop_applications', [
            'product_id' => $product->id,
            'cooperative_id' => $auth['cooperative']->id,
            'status' => 'DRAFT',
        ]);
    }

    public function test_create_application_fails_when_criteria_version_not_published(): void
    {
        $auth = $this->createAuthUser();
        $product = $this->createProduct($auth['cooperative']->id);

        $draftVersion = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => 'DRAFT-VER-' . Str::random(4),
            'name' => 'Bộ tiêu chí Bản Nháp',
            'status' => 'DRAFT',
        ]);

        $response = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/applications', [
                'product_id' => $product->id,
                'criteria_version_id' => $draftVersion->id,
            ]);

        $response->assertStatus(400);
        $response->assertJsonPath('error.code', 'CRITERIA_VERSION_NOT_PUBLISHED');
    }

    public function test_create_application_fails_when_product_belongs_to_another_cooperative(): void
    {
        $auth1 = $this->createAuthUser();
        $auth2 = $this->createAuthUser();

        $otherProduct = $this->createProduct($auth2['cooperative']->id);
        $version = $this->createPublishedCriteriaVersion();

        // User from HTX 1 attempts to create dossier for HTX 2's product -> Fails
        $response = $this->withHeaders($auth1['headers'])
            ->postJson('/api/v1/ocop/applications', [
                'product_id' => $otherProduct->id,
                'criteria_version_id' => $version->id,
            ]);

        $response->assertStatus(400);
        $response->assertJsonPath('error.code', 'PRODUCT_TENANT_MISMATCH');
    }

    public function test_save_self_assessment_score_accumulates_total(): void
    {
        $auth = $this->createAuthUser();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = $this->createPublishedCriteriaVersion();

        $createResp = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/applications', [
                'product_id' => $product->id,
                'criteria_version_id' => $version->id,
            ]);
        $appId = $createResp->json('data.id');

        $indicator1 = $version->groups->first()->criteria->first()->indicators->first();

        // Save self assessment for Indicator 1
        $scoreResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/self-assessments", [
                'indicator_id' => $indicator1->id,
                'score' => 50.0,
                'explanation' => 'Đạt tiêu chuẩn 80% nguyên liệu địa phương',
            ]);

        $scoreResp->assertStatus(201);
        $scoreResp->assertJsonPath('data.score', 50.0);

        // Verify dossier status transitioned to SELF_ASSESSING
        $this->assertDatabaseHas('ocop_applications', [
            'id' => $appId,
            'status' => 'SELF_ASSESSING',
        ]);
    }

    public function test_save_self_assessment_fails_when_score_exceeds_max_score(): void
    {
        $auth = $this->createAuthUser();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = $this->createPublishedCriteriaVersion();

        $createResp = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/applications', [
                'product_id' => $product->id,
                'criteria_version_id' => $version->id,
            ]);
        $appId = $createResp->json('data.id');

        $indicator = $version->groups->first()->criteria->first()->indicators->first(); // max_score = 60.0

        // Score = 80.0 > max_score (60.0) -> Should fail with INVALID_SELF_ASSESSMENT_SCORE
        $scoreResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/self-assessments", [
                'indicator_id' => $indicator->id,
                'score' => 80.0,
            ]);

        $scoreResp->assertStatus(400);
        $scoreResp->assertJsonPath('error.code', 'INVALID_SELF_ASSESSMENT_SCORE');
    }

    public function test_submit_fails_when_not_all_indicators_assessed(): void
    {
        $auth = $this->createAuthUser();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = $this->createPublishedCriteriaVersion(); // Has 2 indicators

        $createResp = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/applications', [
                'product_id' => $product->id,
                'criteria_version_id' => $version->id,
            ]);
        $appId = $createResp->json('data.id');

        $indicators = $version->groups->first()->criteria->first()->indicators;

        // Only assess 1 of 2 indicators
        $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/self-assessments", [
                'indicator_id' => $indicators[0]->id,
                'score' => 50.0,
            ]);

        // Submit attempt -> Should fail with INCOMPLETE_SELF_ASSESSMENT
        $submitResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/submit");

        $submitResp->assertStatus(400);
        $submitResp->assertJsonPath('error.code', 'INCOMPLETE_SELF_ASSESSMENT');
    }

    public function test_submit_succeeds_when_all_indicators_assessed_and_locks_dossier(): void
    {
        $auth = $this->createAuthUser();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = $this->createPublishedCriteriaVersion(); // Has 2 indicators

        $createResp = $this->withHeaders($auth['headers'])
            ->postJson('/api/v1/ocop/applications', [
                'product_id' => $product->id,
                'criteria_version_id' => $version->id,
            ]);
        $appId = $createResp->json('data.id');

        $indicators = $version->groups->first()->criteria->first()->indicators;

        // Assess indicator 1 (60.0)
        $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/self-assessments", [
                'indicator_id' => $indicators[0]->id,
                'score' => 55.0,
            ]);

        // Assess indicator 2 (40.0)
        $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/self-assessments", [
                'indicator_id' => $indicators[1]->id,
                'score' => 35.0,
            ]);

        // Submit attempt -> Should succeed
        $submitResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/submit");

        $submitResp->assertStatus(200);
        $submitResp->assertJsonPath('success', true);
        $submitResp->assertJsonPath('data.status', 'SUBMITTED');
        $this->assertNotNull($submitResp->json('data.submitted_at'));

        // Audit Log verification
        $this->assertDatabaseHas('audit_events', [
            'action' => 'OCOP_APPLICATION_SUBMITTED',
            'entity_id' => $appId,
        ]);
    }

    public function test_read_only_lock_prevents_edits_on_submitted_dossier(): void
    {
        $auth = $this->createAuthUser();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = $this->createPublishedCriteriaVersion();

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-SUBMITTED-' . Str::random(4),
            'status' => 'SUBMITTED',
            'submitted_at' => now(),
        ]);

        $indicator = $version->groups->first()->criteria->first()->indicators->first();

        // Attempting to update self-assessment on SUBMITTED dossier -> Fails with DOSSIER_READ_ONLY_LOCKED
        $scoreResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/self-assessments", [
                'indicator_id' => $indicator->id,
                'score' => 40.0,
            ]);

        $scoreResp->assertStatus(400);
        $scoreResp->assertJsonPath('error.code', 'DOSSIER_READ_ONLY_LOCKED');
    }

    public function test_tenant_isolation_prevents_access_to_other_cooperative_dossier(): void
    {
        $auth1 = $this->createAuthUser();
        $auth2 = $this->createAuthUser();

        $product = $this->createProduct($auth1['cooperative']->id);
        $version = $this->createPublishedCriteriaVersion();

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth1['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-TENANT-' . Str::random(4),
            'status' => 'DRAFT',
        ]);

        // User from HTX 2 tries to view HTX 1's dossier -> Fails with 403 UNAUTHORIZED_TENANT_ACCESS
        $response = $this->withHeaders($auth2['headers'])
            ->getJson("/api/v1/ocop/applications/{$app->id}");

        $response->assertStatus(403);
        $response->assertJsonPath('error.code', 'UNAUTHORIZED_TENANT_ACCESS');
    }
}
