<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CouncilLevelModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaGroupModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriterionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\ConsolidatedResultModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluationSessionModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorAssignmentModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorScoreModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class OcopEdgeCasesTest extends TestCase
{
    private function createAuthUser(?CooperativeModel $cooperative = null, string $roleName = 'HTX_STAFF'): array
    {
        $cooperative = $cooperative ?: CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_EDGE_' . Str::random(4),
            'legal_name' => 'HTX Tân Tiến Edge Cases',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::firstOrCreate(
            ['name' => $roleName],
            ['id' => (string) Str::uuid(), 'code' => $roleName, 'display_name' => $roleName, 'description' => $roleName]
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'edge_' . Str::random(4),
            'email' => 'edge_' . Str::random(4) . '@htx.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Nông Dân Tân Tiến Test',
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

    private function setupEdgeContext(string $cooperativeId): array
    {
        $product = ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperativeId,
            'product_code' => 'PROD-EDGE-' . Str::random(4),
            'product_name' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'category' => 'FOOD',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        $version = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => 'VER-EDGE-' . Str::random(4),
            'name' => 'Bộ Tiêu Chí QĐ 148 Đầy Đủ 2026',
            'status' => 'PUBLISHED',
        ]);

        $group = CriteriaGroupModel::create([
            'id' => (string) Str::uuid(),
            'criteria_version_id' => $version->id,
            'code' => 'GA',
            'name' => 'Phần A: Sản phẩm và sức mạnh cộng đồng',
        ]);

        $criterion = CriterionModel::create([
            'id' => (string) Str::uuid(),
            'criteria_group_id' => $group->id,
            'code' => 'TC-A.1',
            'name' => 'Nguyên liệu & VietGAP',
            'max_score' => 100.0,
        ]);

        $indicator1 = IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion->id,
            'code' => 'TC-A.1.1',
            'name' => 'Tỷ lệ nguyên liệu địa phương',
            'max_score' => 50.0,
            'is_mandatory' => true,
        ]);

        $indicator2 = IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion->id,
            'code' => 'TC-A.3.1',
            'name' => 'Giấy chứng nhận VietGAP',
            'max_score' => 50.0,
            'is_mandatory' => true,
        ]);

        return [
            'product' => $product,
            'version' => $version,
            'group' => $group,
            'criterion' => $criterion,
            'indicator1' => $indicator1,
            'indicator2' => $indicator2,
        ];
    }

    /** @test */
    public function edge_case_1_submit_fails_when_mandatory_indicators_incomplete()
    {
        $auth = $this->createAuthUser();
        $ctx = $this->setupEdgeContext($auth['cooperative']->id);

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $ctx['product']->id,
            'criteria_version_id' => $ctx['version']->id,
            'application_number' => 'HS-EDGE-001',
            'year' => 2026,
            'status' => 'DRAFT',
            'current_level' => 'COMMUNE',
            'self_assessment_score' => 50.0,
        ]);

        $response = $this->postJson("/api/v1/ocop/applications/{$app->id}/submit", [], $auth['headers']);
        
        $response->assertStatus(400)
            ->assertJsonPath('success', false);
    }

    /** @test */
    public function edge_case_2_discrepancy_calculated_when_self_assessment_differs_from_evaluator()
    {
        $authAdmin = $this->createAuthUser(null, 'ADMIN');
        $ctx = $this->setupEdgeContext($authAdmin['cooperative']->id);

        $eval1 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR');
        $eval2 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR');
        $eval3 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR');

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $authAdmin['cooperative']->id,
            'product_id' => $ctx['product']->id,
            'criteria_version_id' => $ctx['version']->id,
            'application_number' => 'HS-EDGE-002',
            'year' => 2026,
            'status' => 'IN_EVALUATION',
            'current_level' => 'PROVINCIAL',
            'self_assessment_score' => 95.0,
        ]);

        $councilLevel = CouncilLevelModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'PROVINCIAL_EDGE_' . Str::random(4),
            'name' => 'Hội đồng Tỉnh Lâm Đồng',
            'level_type' => 'PROVINCIAL',
        ]);

        $session = EvaluationSessionModel::create([
            'id' => (string) Str::uuid(),
            'application_id' => $app->id,
            'session_code' => 'HD-EDGE-' . Str::random(4),
            'session_name' => 'Phiên chấm Ớt Palermo Tân Tiến',
            'council_level_id' => $councilLevel->id,
            'status' => 'IN_PROGRESS',
        ]);

        $assign1 = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'application_id' => $app->id,
            'evaluator_id' => $eval1['user']->id,
            'role' => 'MEMBER',
            'status' => 'LOCKED',
        ]);

        $assign2 = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'application_id' => $app->id,
            'evaluator_id' => $eval2['user']->id,
            'role' => 'MEMBER',
            'status' => 'LOCKED',
        ]);

        $assign3 = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'application_id' => $app->id,
            'evaluator_id' => $eval3['user']->id,
            'role' => 'MEMBER',
            'status' => 'LOCKED',
        ]);

        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign1->id,
            'indicator_id' => $ctx['indicator1']->id,
            'score' => 45.0,
            'is_locked' => true,
        ]);
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign2->id,
            'indicator_id' => $ctx['indicator1']->id,
            'score' => 25.0,
            'is_locked' => true,
        ]);
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign3->id,
            'indicator_id' => $ctx['indicator1']->id,
            'score' => 35.0,
            'is_locked' => true,
        ]);

        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign1->id,
            'indicator_id' => $ctx['indicator2']->id,
            'score' => 40.0,
            'is_locked' => true,
        ]);
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign2->id,
            'indicator_id' => $ctx['indicator2']->id,
            'score' => 40.0,
            'is_locked' => true,
        ]);
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign3->id,
            'indicator_id' => $ctx['indicator2']->id,
            'score' => 40.0,
            'is_locked' => true,
        ]);

        $response = $this->postJson("/api/v1/ocop/evaluation-sessions/{$session->id}/consolidate", [], $authAdmin['headers']);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_score', 75);
    }

    /** @test */
    public function edge_case_3_final_decision_approval_sets_36_month_expiration()
    {
        $auth = $this->createAuthUser(null, 'ADMIN');
        $ctx = $this->setupEdgeContext($auth['cooperative']->id);

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $ctx['product']->id,
            'criteria_version_id' => $ctx['version']->id,
            'application_number' => 'HS-EDGE-003',
            'year' => 2026,
            'status' => 'CONSOLIDATED',
            'current_level' => 'PROVINCIAL',
        ]);

        $councilLevel = CouncilLevelModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'PROVINCIAL_EDGE_' . Str::random(4),
            'name' => 'Hội đồng Tỉnh Lâm Đồng',
            'level_type' => 'PROVINCIAL',
        ]);

        $session = EvaluationSessionModel::create([
            'id' => (string) Str::uuid(),
            'application_id' => $app->id,
            'session_code' => 'HD-EDGE-' . Str::random(4),
            'session_name' => 'Phiên chấm Ớt Palermo Tân Tiến',
            'council_level_id' => $councilLevel->id,
            'status' => 'CONSOLIDATED',
        ]);

        ConsolidatedResultModel::create([
            'id' => (string) Str::uuid(),
            'application_id' => $app->id,
            'evaluation_session_id' => $session->id,
            'total_score' => 85.0,
            'proposed_star_rating' => 4,
            'is_mandatory_passed' => true,
        ]);

        $response = $this->postJson("/api/v1/ocop/applications/{$app->id}/approve", [
            'decision_number' => 'QĐ-148-TANTIEN-2026',
            'decision_date' => '2026-10-02',
            'final_classification' => '4_STAR',
            'authority_reference' => ['issuer' => 'UBND Tỉnh Lâm Đồng'],
        ], $auth['headers']);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.final_classification', '4_STAR');

        $this->assertDatabaseHas('ocop_applications', [
            'id' => $app->id,
            'status' => 'APPROVED',
        ]);
    }
}
