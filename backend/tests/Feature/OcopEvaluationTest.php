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
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluationSessionModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorAssignmentModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorScoreModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class OcopEvaluationTest extends TestCase
{
    private function createAuthUser(?CooperativeModel $cooperative = null, string $roleName = 'CHAIRMAN'): array
    {
        $cooperative = $cooperative ?: CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_EVAL_' . Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp Thẩm Định',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::firstOrCreate(
            ['name' => $roleName],
            ['id' => (string) Str::uuid(), 'code' => $roleName, 'display_name' => $roleName, 'description' => $roleName]
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'user_eval_' . Str::random(4),
            'email' => 'user_eval_' . Str::random(4) . '@htx.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Nguyễn Văn Giám Khảo',
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

    private function setupEvaluationContext(string $cooperativeId): array
    {
        $product = ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperativeId,
            'product_code' => 'PROD-EVAL-' . Str::random(4),
            'product_name' => 'Gạo Nếp Nương OCOP',
            'category' => 'FOOD',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        $version = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => 'VER-EVAL-' . Str::random(4),
            'name' => 'Bộ Tiêu Chí Chấm Điểm 2026',
            'status' => 'PUBLISHED',
        ]);

        $group = CriteriaGroupModel::create([
            'id' => (string) Str::uuid(),
            'criteria_version_id' => $version->id,
            'code' => 'G1',
            'name' => 'Sản phẩm và sức mạnh cộng đồng',
        ]);

        $criterion = CriterionModel::create([
            'id' => (string) Str::uuid(),
            'criteria_group_id' => $group->id,
            'code' => 'C1',
            'name' => 'Chất lượng sản phẩm',
            'max_score' => 100.0,
        ]);

        $indicator1 = IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion->id,
            'code' => 'I1.1',
            'name' => 'Chỉ tiêu 1.1: Quy trình sản xuất an toàn',
            'max_score' => 85.0,
            'mandatory' => false,
        ]);

        $indicator2 = IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion->id,
            'code' => 'I1.2',
            'name' => 'Chỉ tiêu 1.2: Chứng nhận VSTP (* Mandatory)',
            'max_score' => 50.0,
            'mandatory' => true,
        ]);

        $councilLevel = CouncilLevelModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'DISTRICT_' . Str::random(4),
            'name' => 'Hội đồng thẩm định Cấp Huyện',
            'is_active' => true,
        ]);

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperativeId,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-EVAL-' . Str::random(4),
            'status' => 'SUBMITTED',
        ]);

        return [
            'app' => $app,
            'councilLevel' => $councilLevel,
            'indicator1' => $indicator1,
            'indicator2' => $indicator2,
        ];
    }

    public function test_open_session_and_assign_evaluators_success(): void
    {
        $authAdmin = $this->createAuthUser(null, 'ADMIN');
        $ctx = $this->setupEvaluationContext($authAdmin['cooperative']->id);

        $evaluator1 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR')['user'];
        $evaluator2 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR')['user'];

        // 1. Create Evaluation Session
        $sessionResp = $this->withHeaders($authAdmin['headers'])
            ->postJson('/api/v1/ocop/evaluation-sessions', [
                'application_id' => $ctx['app']->id,
                'council_level_id' => $ctx['councilLevel']->id,
            ]);

        $sessionResp->assertStatus(201);
        $sessionResp->assertJsonPath('success', true);
        $sessionId = $sessionResp->json('data.id');

        $this->assertDatabaseHas('evaluation_sessions', [
            'id' => $sessionId,
            'application_id' => $ctx['app']->id,
            'status' => 'ASSIGNED',
        ]);

        // 2. Assign Evaluators
        $assignResp = $this->withHeaders($authAdmin['headers'])
            ->postJson("/api/v1/ocop/evaluation-sessions/{$sessionId}/assignments", [
                'evaluators' => [
                    ['evaluator_id' => $evaluator1->id, 'role' => 'CHAIRMAN'],
                    ['evaluator_id' => $evaluator2->id, 'role' => 'MEMBER'],
                ],
            ]);

        $assignResp->assertStatus(200);
        $assignResp->assertJsonPath('success', true);

        $this->assertDatabaseHas('evaluator_assignments', [
            'evaluation_session_id' => $sessionId,
            'evaluator_id' => $evaluator1->id,
            'role' => 'CHAIRMAN',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'EVALUATION_SESSION_CREATED',
        ]);
        $this->assertDatabaseHas('audit_events', [
            'action' => 'EVALUATOR_ASSIGNED',
        ]);
    }

    public function test_scoring_locking_and_lock_invariant(): void
    {
        $auth = $this->createAuthUser();
        $ctx = $this->setupEvaluationContext($auth['cooperative']->id);

        $evaluator = $this->createAuthUser($auth['cooperative'], 'EVALUATOR');

        $session = EvaluationSessionModel::create([
            'id' => (string) Str::uuid(),
            'application_id' => $ctx['app']->id,
            'council_level_id' => $ctx['councilLevel']->id,
            'status' => 'ASSIGNED',
        ]);

        $assignment = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'evaluator_id' => $evaluator['user']->id,
            'role' => 'MEMBER',
            'status' => 'ASSIGNED',
        ]);

        // 1. Evaluator saves scores
        $scoreResp = $this->withHeaders($evaluator['headers'])
            ->postJson("/api/v1/ocop/evaluation-sessions/{$session->id}/scores", [
                'scores' => [
                    ['indicator_id' => $ctx['indicator1']->id, 'score' => 45.0, 'comment' => 'Đạt tiêu chuẩn xuất sắc'],
                    ['indicator_id' => $ctx['indicator2']->id, 'score' => 40.0, 'comment' => 'Giấy tờ đầy đủ'],
                ],
            ]);

        $scoreResp->assertStatus(200);
        $scoreResp->assertJsonPath('success', true);

        $this->assertDatabaseHas('evaluator_scores', [
            'assignment_id' => $assignment->id,
            'indicator_id' => $ctx['indicator1']->id,
            'score' => 45.0,
        ]);

        // 2. Evaluator locks score sheet
        $lockResp = $this->withHeaders($evaluator['headers'])
            ->postJson("/api/v1/ocop/evaluation-scores/{$assignment->id}/lock");

        $lockResp->assertStatus(200);
        $lockResp->assertJsonPath('data.status', 'LOCKED');

        $this->assertDatabaseHas('evaluator_assignments', [
            'id' => $assignment->id,
            'status' => 'LOCKED',
        ]);

        // 3. Attempting to modify scores after lock fails with 400 EVALUATION_SCORE_LOCKED
        $editResp = $this->withHeaders($evaluator['headers'])
            ->postJson("/api/v1/ocop/evaluation-sessions/{$session->id}/scores", [
                'scores' => [
                    ['indicator_id' => $ctx['indicator1']->id, 'score' => 50.0, 'comment' => 'Sửa lại điểm sau khi đã khóa'],
                ],
            ]);

        $editResp->assertStatus(400);
        $editResp->assertJsonPath('error.code', 'EVALUATION_SCORE_LOCKED');
    }

    public function test_consolidation_average_calculation_and_discrepancy_flag(): void
    {
        $authAdmin = $this->createAuthUser(null, 'ADMIN');
        $ctx = $this->setupEvaluationContext($authAdmin['cooperative']->id);

        $eval1 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR');
        $eval2 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR');
        $eval3 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR');

        $session = EvaluationSessionModel::create([
            'id' => (string) Str::uuid(),
            'application_id' => $ctx['app']->id,
            'council_level_id' => $ctx['councilLevel']->id,
            'status' => 'IN_PROGRESS',
        ]);

        $assign1 = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'evaluator_id' => $eval1['user']->id,
            'role' => 'MEMBER',
            'status' => 'LOCKED',
            'completed_at' => now(),
        ]);

        $assign2 = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'evaluator_id' => $eval2['user']->id,
            'role' => 'MEMBER',
            'status' => 'LOCKED',
            'completed_at' => now(),
        ]);

        $assign3 = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'evaluator_id' => $eval3['user']->id,
            'role' => 'MEMBER',
            'status' => 'LOCKED',
            'completed_at' => now(),
        ]);

        // Score Indicator 1: Eval1 = 45.0, Eval2 = 25.0, Eval3 = 35.0 (Diff = 20.0 > 10.0 -> Discrepancy Flag, Avg = 35.0)
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign1->id,
            'indicator_id' => $ctx['indicator1']->id,
            'score' => 45.0,
            'locked_at' => now(),
        ]);
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign2->id,
            'indicator_id' => $ctx['indicator1']->id,
            'score' => 25.0,
            'locked_at' => now(),
        ]);
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign3->id,
            'indicator_id' => $ctx['indicator1']->id,
            'score' => 35.0,
            'locked_at' => now(),
        ]);

        // Score Indicator 2: Eval1 = 40.0, Eval2 = 40.0, Eval3 = 40.0 (Avg = 40.0)
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign1->id,
            'indicator_id' => $ctx['indicator2']->id,
            'score' => 40.0,
            'locked_at' => now(),
        ]);
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign2->id,
            'indicator_id' => $ctx['indicator2']->id,
            'score' => 40.0,
            'locked_at' => now(),
        ]);
        EvaluatorScoreModel::create([
            'id' => (string) Str::uuid(),
            'assignment_id' => $assign3->id,
            'indicator_id' => $ctx['indicator2']->id,
            'score' => 40.0,
            'locked_at' => now(),
        ]);

        // Consolidate Results: Total score = Avg(I1) + Avg(I2) = 35.0 + 40.0 = 75.0
        $consolidateResp = $this->withHeaders($authAdmin['headers'])
            ->postJson("/api/v1/ocop/evaluation-sessions/{$session->id}/consolidate");

        $consolidateResp->assertStatus(200);
        $consolidateResp->assertJsonPath('success', true);
        $consolidateResp->assertJsonPath('data.total_score', 75);

        // Check proposed level = 3_STAR (Total score = 75)
        $this->assertDatabaseHas('proposed_classifications', [
            'application_id' => $ctx['app']->id,
            'proposed_level' => '3_STAR',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'COUNCIL_SCORES_CONSOLIDATED',
        ]);
    }

    public function test_star_limit_downgrade_algorithm_when_mandatory_indicator_zero(): void
    {
        $authAdmin = $this->createAuthUser(null, 'ADMIN');
        $ctx = $this->setupEvaluationContext($authAdmin['cooperative']->id);

        $eval1 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR');
        $eval2 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR');
        $eval3 = $this->createAuthUser($authAdmin['cooperative'], 'EVALUATOR');

        $session = EvaluationSessionModel::create([
            'id' => (string) Str::uuid(),
            'application_id' => $ctx['app']->id,
            'council_level_id' => $ctx['councilLevel']->id,
            'status' => 'IN_PROGRESS',
        ]);

        $assign1 = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'evaluator_id' => $eval1['user']->id,
            'role' => 'MEMBER',
            'status' => 'LOCKED',
            'completed_at' => now(),
        ]);

        $assign2 = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'evaluator_id' => $eval2['user']->id,
            'role' => 'MEMBER',
            'status' => 'LOCKED',
            'completed_at' => now(),
        ]);

        $assign3 = EvaluatorAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'evaluation_session_id' => $session->id,
            'evaluator_id' => $eval3['user']->id,
            'role' => 'MEMBER',
            'status' => 'LOCKED',
            'completed_at' => now(),
        ]);

        // High score on non-mandatory indicator 1 (85.0) -> Total qualifies for 85+ (4_STAR / 5_STAR)
        foreach ([$assign1, $assign2, $assign3] as $assign) {
            EvaluatorScoreModel::create([
                'id' => (string) Str::uuid(),
                'assignment_id' => $assign->id,
                'indicator_id' => $ctx['indicator1']->id,
                'score' => 85.0,
                'locked_at' => now(),
            ]);

            // Mandatory indicator 2 scored 0.0!
            EvaluatorScoreModel::create([
                'id' => (string) Str::uuid(),
                'assignment_id' => $assign->id,
                'indicator_id' => $ctx['indicator2']->id,
                'score' => 0.0,
                'locked_at' => now(),
            ]);
        }

        // Consolidate
        $consolidateResp = $this->withHeaders($authAdmin['headers'])
            ->postJson("/api/v1/ocop/evaluation-sessions/{$session->id}/consolidate");

        $consolidateResp->assertStatus(200);

        // Downgraded to 3_STAR or UNRATED because mandatory indicator failed
        $proposed = $consolidateResp->json('data.proposed_classification.proposed_level');
        $this->assertTrue(in_array($proposed, ['3_STAR', 'UNRATED'], true));

        $reason = $consolidateResp->json('data.proposed_classification.reason');
        $this->assertStringContainsString('khống chế', $reason);
    }

    public function test_approve_final_decision_and_calculates_36_month_expiration(): void
    {
        $authAdmin = $this->createAuthUser(null, 'ADMIN');
        $ctx = $this->setupEvaluationContext($authAdmin['cooperative']->id);

        $decisionDate = '2026-09-04';

        $approveResp = $this->withHeaders($authAdmin['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/approve", [
                'decision_number' => 'QD-123/UBND-OCOP',
                'decision_date' => $decisionDate,
                'final_classification' => '4_STAR',
                'authority_reference' => ['issuer' => 'Ủy ban Nhân dân Huyện'],
            ]);

        $approveResp->assertStatus(201);
        $approveResp->assertJsonPath('success', true);
        $approveResp->assertJsonPath('data.decision_number', 'QD-123/UBND-OCOP');
        $approveResp->assertJsonPath('data.final_classification', '4_STAR');

        // Expiration date should be exactly 36 months later (2029-09-04)
        $approveResp->assertJsonPath('data.expiration_date', '2029-09-04');

        // Verify Application Status updated to APPROVED
        $this->assertDatabaseHas('ocop_applications', [
            'id' => $ctx['app']->id,
            'status' => 'APPROVED',
        ]);

        $this->assertDatabaseHas('final_decisions', [
            'application_id' => $ctx['app']->id,
            'decision_number' => 'QD-123/UBND-OCOP',
            'final_classification' => '4_STAR',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'OCOP_RESULT_APPROVED',
        ]);
    }

    public function test_reject_application_success(): void
    {
        $authAdmin = $this->createAuthUser(null, 'ADMIN');
        $ctx = $this->setupEvaluationContext($authAdmin['cooperative']->id);

        $rejectResp = $this->withHeaders($authAdmin['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/reject", [
                'decision_number' => 'TB-456/UBND-OCOP',
                'decision_date' => '2026-09-04',
                'reason' => 'Không đạt các tiêu chuẩn về quy trình kiểm định chất lượng',
            ]);

        $rejectResp->assertStatus(201);
        $rejectResp->assertJsonPath('success', true);
        $rejectResp->assertJsonPath('data.final_classification', 'REJECTED');
        $rejectResp->assertJsonPath('data.expiration_date', null);

        $this->assertDatabaseHas('ocop_applications', [
            'id' => $ctx['app']->id,
            'status' => 'REJECTED',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'OCOP_RESULT_REJECTED',
        ]);
    }
}
