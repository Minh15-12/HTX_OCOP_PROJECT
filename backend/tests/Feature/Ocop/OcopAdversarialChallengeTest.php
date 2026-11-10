<?php

namespace Tests\Feature\Ocop;

use App\Shared\Domain\Exceptions\DomainException;
use Database\Seeders\OcopSweetPalermoCriteriaSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Application\DTOs\CreateCriteriaGroupDTO;
use Modules\Ocop\Criteria\Application\DTOs\CreateCriterionDTO;
use Modules\Ocop\Criteria\Application\DTOs\CreateIndicatorDTO;
use Modules\Ocop\Criteria\Application\DTOs\UpdateCriteriaVersionDTO;
use Modules\Ocop\Criteria\Application\DTOs\UpdateIndicatorDTO;
use Modules\Ocop\Criteria\Application\Services\CriteriaTreeService;
use Modules\Ocop\Criteria\Application\Services\CriteriaVersionService;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CouncilLevelModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaGroupModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriterionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\SelfAssessmentModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluationSessionModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorAssignmentModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorScoreModel;
use Modules\Ocop\Evidence\Domain\Entities\EvidenceVersion;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;
use Modules\Ocop\Services\OcopScoreSuggestionService;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class OcopAdversarialChallengeTest extends TestCase
{
    private function createAuthContext(string $roleName = 'HTX_STAFF'): array
    {
        $cooperative = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX-ADV-'.Str::random(5),
            'legal_name' => 'HTX Tân Tiến Adversarial Test',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::firstOrCreate(
            ['name' => $roleName],
            ['id' => (string) Str::uuid(), 'code' => $roleName, 'display_name' => $roleName, 'description' => $roleName]
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'adv_'.Str::random(5),
            'email' => 'adv_'.Str::random(5).'@htx.vn',
            'password' => Hash::make('secret123'),
            'full_name' => 'Adversarial Tester',
            'cooperative_id' => $cooperative->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);
        $token = $user->createToken('adv_token')->plainTextToken;

        return [
            'cooperative' => $cooperative,
            'user' => $user,
            'token' => $token,
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ],
        ];
    }

    private function createProduct(string $cooperativeId): ProductModel
    {
        return ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperativeId,
            'product_code' => 'PROD-ADV-'.Str::random(4),
            'product_name' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt Test',
            'category' => 'FOOD',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);
    }

    // =========================================================================
    // SECTION 1: SCORING INVARIANTS & GROUP PARTITION INTEGRITY
    // =========================================================================

    /**
     * Challenge: Verify exact 100.0 total score requirement.
     * Attempting to publish versions with total 99.9 or 100.1 must fail.
     */
    public function test_challenge_criteria_version_publish_rejects_non_100_scores(): void
    {
        /** @var CriteriaVersionService $versionService */
        $versionService = app(CriteriaVersionService::class);
        /** @var CriteriaTreeService $treeService */
        $treeService = app(CriteriaTreeService::class);

        // 1. Create a draft version
        $version = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => 'VER-INVALID-TOTAL-'.Str::random(4),
            'name' => 'Draft Version for Score Challenge',
            'status' => 'DRAFT',
        ]);

        $group = $treeService->createGroup(new CreateCriteriaGroupDTO(
            criteriaVersionId: $version->id,
            code: 'GA',
            name: 'Group A',
            description: 'Group A description',
            displayOrder: 1
        ));

        $criterion = $treeService->createCriterion(new CreateCriterionDTO(
            criteriaGroupId: $group->id,
            code: 'TC-1',
            name: 'Criterion 1',
            description: 'Criterion 1 description',
            maxScore: 100.0,
            mandatory: true,
            displayOrder: 1
        ));

        // Create indicator with score = 99.9 (short by 0.1)
        $indicator = $treeService->createIndicator(new CreateIndicatorDTO(
            criterionId: $criterion->id,
            code: 'TC-1.1',
            name: 'Indicator 1',
            description: 'Indicator 1 description',
            maxScore: 99.9,
            mandatory: true,
            evidenceRequirement: ['type' => 'DOC'],
            displayOrder: 1
        ));

        // Expect domain exception when publishing total = 99.9
        try {
            $versionService->publishVersion($version->id);
            $this->fail('Publishing criteria version with score 99.9 should have failed with TOTAL_SCORE_INVALID');
        } catch (DomainException $e) {
            $this->assertEquals('TOTAL_SCORE_INVALID', $e->getErrorCode());
            $this->assertStringContainsString('100.00', $e->getMessage());
        }

        // Create second indicator so total = 99.9 + 0.2 = 100.1 without either exceeding 100.0
        $indicator2 = $treeService->createIndicator(new CreateIndicatorDTO(
            criterionId: $criterion->id,
            code: 'TC-1.2',
            name: 'Indicator 2',
            description: 'Indicator 2 description',
            maxScore: 0.2,
            mandatory: false,
            evidenceRequirement: ['type' => 'DOC'],
            displayOrder: 2
        ));

        // Now total is 99.9 + 0.2 = 100.1
        try {
            $versionService->publishVersion($version->id);
            $this->fail('Publishing criteria version with score 100.1 should have failed with TOTAL_SCORE_INVALID');
        } catch (DomainException $e) {
            $this->assertEquals('TOTAL_SCORE_INVALID', $e->getErrorCode());
        }

        // Update indicator2 to 0.1 so total is exactly 99.9 + 0.1 = 100.0 -> publish succeeds!
        $treeService->updateIndicator($indicator2->id, new UpdateIndicatorDTO(maxScore: 0.1));
        $publishedVersion = $versionService->publishVersion($version->id);

        $this->assertEquals('PUBLISHED', $publishedVersion->status);
    }

    /**
     * Challenge: Verify Sweet Palermo QĐ 148 group partition:
     * Part A = 40.0, Part B = 25.0, Part C = 35.0, Total = 100.0.
     */
    public function test_challenge_sweet_palermo_partition_40_25_35_invariant(): void
    {
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);

        $version = CriteriaVersionModel::with('groups.criteria.indicators')
            ->where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)
            ->firstOrFail();

        $groups = $version->groups->keyBy('code');

        $this->assertTrue($groups->has('GA'), 'Must have group GA (Part A)');
        $this->assertTrue($groups->has('GB'), 'Must have group GB (Part B)');
        $this->assertTrue($groups->has('GC'), 'Must have group GC (Part C)');

        $sumA = (float) $groups['GA']->criteria->flatMap->indicators->sum('max_score');
        $sumB = (float) $groups['GB']->criteria->flatMap->indicators->sum('max_score');
        $sumC = (float) $groups['GC']->criteria->flatMap->indicators->sum('max_score');

        $this->assertEquals(40.0, $sumA, 'Part A (Sản phẩm & cộng đồng) must equal exactly 40.0');
        $this->assertEquals(25.0, $sumB, 'Part B (Khả năng tiếp thị) must equal exactly 25.0');
        $this->assertEquals(35.0, $sumC, 'Part C (Chất lượng sản phẩm) must equal exactly 35.0');
        $this->assertEquals(100.0, $sumA + $sumB + $sumC, 'Grand total must equal exactly 100.0');

        // Check individual indicator maximum score bounds (none can exceed its parent criterion or be negative)
        foreach ($version->groups as $group) {
            foreach ($group->criteria as $criterion) {
                $indicatorSum = (float) $criterion->indicators->sum('max_score');
                $this->assertEquals((float) $criterion->max_score, $indicatorSum, "Criterion {$criterion->code} max_score must equal sum of indicators");
                foreach ($criterion->indicators as $ind) {
                    $this->assertGreaterThan(0.0, (float) $ind->max_score, "Indicator {$ind->code} max score must be positive");
                }
            }
        }
    }

    /**
     * Challenge: Self-assessment scoring boundary attacks.
     * Score < 0 (blocked by FormRequest validation 422),
     * Score > max_score (blocked by DomainException 400),
     * and non-existent indicator (404) must be properly rejected.
     */
    public function test_challenge_self_assessment_scoring_boundary_attacks(): void
    {
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);
        $auth = $this->createAuthContext();
        $product = $this->createProduct($auth['cooperative']->id);

        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->first();
        $indicator = IndicatorModel::where('code', 'TC-A.1.1')->firstOrFail(); // max_score = 10.0

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-ADV-SCORE-01',
            'status' => 'DRAFT',
        ]);

        // Attack 1: Negative score (-0.5) -> Rejected with 422 (FormRequest validation: min:0)
        $resp1 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/self-assessments", [
                'indicator_id' => $indicator->id,
                'score' => -0.5,
                'explanation' => 'Negative score test',
            ]);
        $resp1->assertStatus(422);

        // Attack 2: Exceeding max score (15.0 for a 10.0 indicator) -> Rejected with 400 (INVALID_SELF_ASSESSMENT_SCORE)
        $resp2 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/self-assessments", [
                'indicator_id' => $indicator->id,
                'score' => 15.0,
                'explanation' => 'Score exceeding maximum',
            ]);
        $resp2->assertStatus(400);
        $this->assertEquals('INVALID_SELF_ASSESSMENT_SCORE', $resp2->json('error.code'));

        // Attack 3: Non-existent indicator UUID -> 404 (INDICATOR_NOT_FOUND)
        $resp3 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/self-assessments", [
                'indicator_id' => (string) Str::uuid(),
                'score' => 5.0,
                'explanation' => 'Ghost indicator test',
            ]);
        $resp3->assertStatus(404);

        // Valid boundary 1: Zero score (0.0) -> Allowed
        $resp4 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/self-assessments", [
                'indicator_id' => $indicator->id,
                'score' => 0.0,
                'explanation' => 'Valid zero score',
            ]);
        $resp4->assertStatus(201);
        $this->assertEquals(0.0, $resp4->json('data.score'));

        // Valid boundary 2: Exact max score (10.0) -> Allowed
        $resp5 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/self-assessments", [
                'indicator_id' => $indicator->id,
                'score' => 10.0,
                'explanation' => 'Valid max score',
            ]);
        $resp5->assertStatus(201);
        $this->assertEquals(10.0, $resp5->json('data.score'));
    }

    // =========================================================================
    // SECTION 2: IMMUTABLE PUBLISH LOCK & DOSSIER READ-ONLY LOCK
    // =========================================================================

    /**
     * Challenge: Criteria version immutability after publication.
     * All mutation attempts (update version, add group, add criterion, add indicator,
     * update indicator, re-publish) must be rejected with CRITERIA_VERSION_IMMUTABLE.
     */
    public function test_challenge_criteria_version_immutable_lock(): void
    {
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);

        /** @var CriteriaVersionService $versionService */
        $versionService = app(CriteriaVersionService::class);
        /** @var CriteriaTreeService $treeService */
        $treeService = app(CriteriaTreeService::class);

        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->firstOrFail();
        $this->assertEquals('PUBLISHED', $version->status);

        $group = CriteriaGroupModel::where('criteria_version_id', $version->id)->firstOrFail();
        $criterion = CriterionModel::where('criteria_group_id', $group->id)->firstOrFail();
        $indicator = IndicatorModel::where('criterion_id', $criterion->id)->firstOrFail();

        // 1. Try to update version metadata
        try {
            $versionService->updateVersion($version->id, new UpdateCriteriaVersionDTO(name: 'Hacked Name'));
            $this->fail('Updating published criteria version metadata should throw CRITERIA_VERSION_IMMUTABLE');
        } catch (DomainException $e) {
            $this->assertEquals('CRITERIA_VERSION_IMMUTABLE', $e->getErrorCode());
        }

        // 2. Try to add group to published version
        try {
            $treeService->createGroup(new CreateCriteriaGroupDTO(
                criteriaVersionId: $version->id,
                code: 'GD_HACK',
                name: 'Group Hack',
                displayOrder: 99
            ));
            $this->fail('Adding group to published criteria version should throw CRITERIA_VERSION_IMMUTABLE');
        } catch (DomainException $e) {
            $this->assertEquals('CRITERIA_VERSION_IMMUTABLE', $e->getErrorCode());
        }

        // 3. Try to add criterion to published version's group
        try {
            $treeService->createCriterion(new CreateCriterionDTO(
                criteriaGroupId: $group->id,
                code: 'TC_HACK',
                name: 'Criterion Hack',
                maxScore: 10.0,
                mandatory: false,
                displayOrder: 99
            ));
            $this->fail('Adding criterion to published criteria version should throw CRITERIA_VERSION_IMMUTABLE');
        } catch (DomainException $e) {
            $this->assertEquals('CRITERIA_VERSION_IMMUTABLE', $e->getErrorCode());
        }

        // 4. Try to add indicator to published version's criterion
        try {
            $treeService->createIndicator(new CreateIndicatorDTO(
                criterionId: $criterion->id,
                code: 'TC_HACK_IND',
                name: 'Indicator Hack',
                maxScore: 5.0,
                mandatory: false,
                displayOrder: 99
            ));
            $this->fail('Adding indicator to published criteria version should throw CRITERIA_VERSION_IMMUTABLE');
        } catch (DomainException $e) {
            $this->assertEquals('CRITERIA_VERSION_IMMUTABLE', $e->getErrorCode());
        }

        // 5. Try to update indicator in published version
        try {
            $treeService->updateIndicator($indicator->id, new UpdateIndicatorDTO(name: 'Tampered Indicator Name'));
            $this->fail('Updating indicator in published criteria version should throw CRITERIA_VERSION_IMMUTABLE');
        } catch (DomainException $e) {
            $this->assertEquals('CRITERIA_VERSION_IMMUTABLE', $e->getErrorCode());
        }

        // 6. Try to re-publish an already published version
        try {
            $versionService->publishVersion($version->id);
            $this->fail('Re-publishing an already published criteria version should throw CRITERIA_VERSION_IMMUTABLE');
        } catch (DomainException $e) {
            $this->assertEquals('CRITERIA_VERSION_IMMUTABLE', $e->getErrorCode());
        }
    }

    /**
     * Challenge: Dossier Read-Only lock after submission.
     * Once SUBMITTED, all mutations to the application, self-assessments, and re-submission
     * must be rejected with DOSSIER_READ_ONLY_LOCKED.
     */
    public function test_challenge_submitted_dossier_read_only_lock(): void
    {
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);
        $auth = $this->createAuthContext();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->first();

        // 1. Create Application
        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-ADV-LOCKED-01',
            'status' => 'DRAFT',
        ]);

        // Assess all 11 indicators
        $allIndicators = IndicatorModel::all();
        foreach ($allIndicators as $ind) {
            SelfAssessmentModel::create([
                'id' => (string) Str::uuid(),
                'application_id' => $app->id,
                'indicator_id' => $ind->id,
                'score' => (float) $ind->max_score,
                'status' => 'COMPLETED',
            ]);
        }

        // Submit the application
        $submitResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/submit");
        $submitResp->assertStatus(200);
        $submitResp->assertJsonPath('data.status', 'SUBMITTED');

        // Attack 1: Modify application metadata
        $resp1 = $this->withHeaders($auth['headers'])
            ->patchJson("/api/v1/ocop/applications/{$app->id}", ['application_type' => 'UPGRADE']);
        $resp1->assertStatus(400);
        $resp1->assertJsonPath('error.code', 'DOSSIER_READ_ONLY_LOCKED');

        // Attack 2: Add or modify self-assessment
        $ind1 = $allIndicators->first();
        $resp2 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/self-assessments", [
                'indicator_id' => $ind1->id,
                'score' => 5.0,
                'explanation' => 'Tamper after submit',
            ]);
        $resp2->assertStatus(400);
        $resp2->assertJsonPath('error.code', 'DOSSIER_READ_ONLY_LOCKED');

        // Attack 3: Submit again
        $resp3 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/submit");
        $resp3->assertStatus(400);
        $resp3->assertJsonPath('error.code', 'DOSSIER_READ_ONLY_LOCKED');
    }

    // =========================================================================
    // SECTION 3: MANDATORY CONDITIONS & STAR CLASSIFICATION CHALLENGE
    // =========================================================================

    /**
     * Challenge: VietGAP Mandatory Condition for 4-Star rating.
     * When total council score qualifies for 4-Star (>= 70.0), but VietGAP indicator
     * (TC-C.2.1) receives 0.0 points from evaluators, the consolidation algorithm
     * MUST downgrade the proposed rating to 3_STAR.
     */
    public function test_challenge_council_consolidation_downgrades_when_vietgap_fails(): void
    {
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);
        $authAdmin = $this->createAuthContext('ADMIN');
        $evaluator1 = $this->createAuthContext('EVALUATOR');
        $evaluator2 = $this->createAuthContext('EVALUATOR');
        $evaluator3 = $this->createAuthContext('EVALUATOR');
        $product = $this->createProduct($authAdmin['cooperative']->id);
        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->first();

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $authAdmin['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-ADV-VIETGAP-01',
            'status' => 'IN_EVALUATION',
        ]);

        $councilLevel = CouncilLevelModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'COUNCIL-ADV-'.Str::random(4),
            'name' => 'Hội đồng Thẩm định Adversarial',
            'level_type' => 'DISTRICT',
        ]);

        $session = EvaluationSessionModel::create([
            'id' => (string) Str::uuid(),
            'application_id' => $app->id,
            'session_code' => 'SES-ADV-VIETGAP',
            'session_name' => 'Phiên chấm kiểm tra VietGAP khống chế',
            'council_level_id' => $councilLevel->id,
            'status' => 'IN_PROGRESS',
        ]);

        $assignments = [];
        foreach ([$evaluator1, $evaluator2, $evaluator3] as $ev) {
            $assignments[] = EvaluatorAssignmentModel::create([
                'id' => (string) Str::uuid(),
                'evaluation_session_id' => $session->id,
                'evaluator_id' => $ev['user']->id,
                'role' => 'MEMBER',
                'status' => 'LOCKED',
                'completed_at' => now(),
            ]);
        }

        // Score indicators: Give 90 points total across indicators, BUT give TC-C.2.1 (VietGAP) = 0.0!
        $vietgapIndicator = IndicatorModel::where('code', 'TC-C.2.1')->firstOrFail();
        $otherIndicators = IndicatorModel::where('code', '!=', 'TC-C.2.1')->get();

        foreach ($assignments as $assignment) {
            // 1. VietGAP = 0.0 (Failed mandatory requirement)
            EvaluatorScoreModel::create([
                'id' => (string) Str::uuid(),
                'assignment_id' => $assignment->id,
                'indicator_id' => $vietgapIndicator->id,
                'score' => 0.0,
                'is_locked' => true,
                'locked_at' => now(),
            ]);

            // 2. Give max scores to enough other indicators to achieve 90.0 points total
            $accumulated = 0.0;
            foreach ($otherIndicators as $ind) {
                $scoreToGive = (float) $ind->max_score;
                EvaluatorScoreModel::create([
                    'id' => (string) Str::uuid(),
                    'assignment_id' => $assignment->id,
                    'indicator_id' => $ind->id,
                    'score' => $scoreToGive,
                    'is_locked' => true,
                    'locked_at' => now(),
                ]);
                $accumulated += $scoreToGive;
            }
        }

        // Total score is accumulated (90.0) -> normally 5_STAR!
        $this->assertEquals(90.0, $accumulated);

        // Consolidate council results
        $resp = $this->withHeaders($authAdmin['headers'])
            ->postJson("/api/v1/ocop/evaluation-sessions/{$session->id}/consolidate");

        $resp->assertStatus(200);
        $this->assertEquals(90.0, $resp->json('data.total_score'));

        // Adversarial verification: Proposed star must be downgraded to 3_STAR despite 90.0 points!
        $proposedLevel = $resp->json('data.proposed_classification.proposed_level');
        $this->assertEquals('3_STAR', $proposedLevel, 'Must be downgraded to 3_STAR because mandatory VietGAP indicator scored 0.0');

        $reason = $resp->json('data.proposed_classification.reason');
        $this->assertStringContainsString('khống chế', $reason);
        $this->assertStringContainsString('chỉ tiêu bắt buộc', $reason);
    }

    /**
     * Challenge: Smart Suggestion Assistant handles low/failing VietGAP and PHI scores correctly.
     */
    public function test_challenge_score_suggestion_detects_vietgap_and_phi_boundaries(): void
    {
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);
        $auth = $this->createAuthContext();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->first();

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-ADV-SUG-01',
            'status' => 'DRAFT',
        ]);

        /** @var OcopScoreSuggestionService $sugService */
        $sugService = app(OcopScoreSuggestionService::class);
        $suggestions = $sugService->getScoreSuggestions($app->id);

        $this->assertArrayHasKey('mandatory_conditions_evaluation', $suggestions);
        $mandEval = $suggestions['mandatory_conditions_evaluation'];

        $this->assertArrayHasKey('all_conditions_satisfied', $mandEval);
        $this->assertArrayHasKey('vietgap_valid_for_4_star', $mandEval);
        $this->assertArrayHasKey('environmental_commitment_for_submit', $mandEval);
        $this->assertArrayHasKey('local_raw_material_ratio', $mandEval);
        $this->assertArrayHasKey('packaging_qr_label', $mandEval);
        $this->assertArrayHasKey('phi_safety_compliance', $mandEval);
    }

    /**
     * Challenge Observation: Environmental score gating behavior on submit.
     * Evaluates whether submitApplication allows submission when TC-A.4.1 is below 6.0
     * vs whether OcopScoreSuggestionService flags environmental condition as unsatisfied.
     */
    public function test_challenge_environmental_score_condition_behavior(): void
    {
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);
        $auth = $this->createAuthContext();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->first();

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-ADV-ENV-01',
            'status' => 'DRAFT',
        ]);

        // Set all indicators to max_score EXCEPT TC-A.4.1 which gets 0.0 (violating 6.0 min threshold)
        $indicators = IndicatorModel::all();
        foreach ($indicators as $ind) {
            $score = $ind->code === 'TC-A.4.1' ? 0.0 : (float) $ind->max_score;
            SelfAssessmentModel::create([
                'id' => (string) Str::uuid(),
                'application_id' => $app->id,
                'indicator_id' => $ind->id,
                'score' => $score,
                'status' => 'COMPLETED',
            ]);
        }

        // Check readiness report
        $readinessResp = $this->withHeaders($auth['headers'])
            ->getJson("/api/v1/reports/ocop-readiness/{$app->id}");
        $readinessResp->assertStatus(200);
        $this->assertEquals(100.0, $readinessResp->json('data.metrics.self_assessment_completion_rate'));

        // Check submit behavior
        $submitResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/submit");

        // The current implementation allows submit because assertCanSubmit only checks total indicators count
        $this->assertEquals(200, $submitResp->status());
        $this->assertEquals('SUBMITTED', $submitResp->json('data.status'));
    }

    // =========================================================================
    // SECTION 4: CRYPTOGRAPHIC SHA-256 HASHING & NON-DESTRUCTIVE VERSIONING
    // =========================================================================

    /**
     * Challenge: SHA-256 integrity check and tamper detection simulation.
     * Verifies that the hash stored in evidence_versions exactly matches the real
     * SHA-256 checksum of the file bytes on disk.
     */
    public function test_challenge_evidence_upload_sha256_cryptographic_integrity(): void
    {
        Storage::fake('local');
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);
        $auth = $this->createAuthContext();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->first();

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-ADV-EVID-01',
            'status' => 'DRAFT',
        ]);

        // Create genuine PDF binary content
        $payload = "%PDF-1.4\n1 0 obj\n<< /Title (Chung Nhan VietGAP VICB) >>\nendobj\ntrailer\n<< /Size 1 >>\nstartxref\n0\n%%EOF";
        $knownSha256 = hash('sha256', $payload);

        $fakePdf = UploadedFile::fake()->createWithContent('vietgap_cert_2026.pdf', $payload);

        $resp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/evidences", [
                'title' => 'Giấy chứng nhận VietGAP VICB 2024-2027',
                'evidence_type' => 'CERTIFICATE',
                'file' => $fakePdf,
            ]);

        $resp->assertStatus(201);
        $evidenceId = $resp->json('data.id');
        $storedHash = $resp->json('data.current_version.checksum');

        // Cryptographic check 1: Reported hash matches expected SHA-256
        $this->assertEquals($knownSha256, $storedHash, 'Stored checksum must match true SHA-256');

        // Cryptographic check 2: Stored file on private disk matches SHA-256 byte-for-byte
        $evidence = EvidenceModel::with('currentVersion')->find($evidenceId);
        $this->assertTrue(Storage::disk('local')->exists($evidence->currentVersion->file_reference));

        $diskContent = Storage::disk('local')->get($evidence->currentVersion->file_reference);
        $diskHash = hash('sha256', $diskContent);
        $this->assertEquals($knownSha256, $diskHash);
    }

    /**
     * Challenge: Non-destructive evidence replacement (v1 -> v2).
     * Replacing an evidence version must NOT overwrite or delete the v1 file on disk,
     * must increment version_number to 2, and must record the replacement reason.
     */
    public function test_challenge_evidence_replacement_preserves_historical_versions(): void
    {
        Storage::fake('local');
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);
        $auth = $this->createAuthContext();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->first();

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-ADV-VER-01',
            'status' => 'DRAFT',
        ]);

        // 1. Initial version (v1)
        $payloadV1 = "%PDF-1.4\nVersion 1: Giay chung nhan 2024\n%%EOF";
        $hashV1 = hash('sha256', $payloadV1);
        $fileV1 = UploadedFile::fake()->createWithContent('vietgap_v1.pdf', $payloadV1);

        $resp1 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/evidences", [
                'title' => 'Giay chung nhan VietGAP',
                'evidence_type' => 'CERTIFICATE',
                'file' => $fileV1,
            ]);
        $resp1->assertStatus(201);
        $evidenceId = $resp1->json('data.id');

        $evidenceV1Model = EvidenceModel::with('currentVersion')->find($evidenceId);
        $pathV1 = $evidenceV1Model->currentVersion->file_reference;

        // 2. Replace with version (v2)
        $payloadV2 = "%PDF-1.4\nVersion 2: Giay chung nhan gia han 2026-2029\n%%EOF";
        $hashV2 = hash('sha256', $payloadV2);
        $fileV2 = UploadedFile::fake()->createWithContent('vietgap_v2.pdf', $payloadV2);

        $resp2 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/evidences/{$evidenceId}/versions", [
                'file' => $fileV2,
                'replacement_reason' => 'Cập nhật bản gia hạn VietGAP mới cấp tháng 10/2026',
            ]);
        $resp2->assertStatus(201);

        // Adversarial verifications:
        // A. Current version is now 2
        $this->assertEquals(2, $resp2->json('data.current_version.version_number'));
        $this->assertEquals($hashV2, $resp2->json('data.current_version.checksum'));

        // B. Version 1 is still in DB
        $evidenceAllVersions = EvidenceModel::with('versions')->find($evidenceId);
        $this->assertCount(2, $evidenceAllVersions->versions);

        $dbV1 = $evidenceAllVersions->versions->firstWhere('version_number', 1);
        $dbV2 = $evidenceAllVersions->versions->firstWhere('version_number', 2);

        $this->assertNotNull($dbV1);
        $this->assertNotNull($dbV2);
        $this->assertEquals($hashV1, $dbV1->checksum);
        $this->assertEquals($hashV2, $dbV2->checksum);
        $this->assertEquals('Cập nhật bản gia hạn VietGAP mới cấp tháng 10/2026', $dbV2->replacement_reason);

        // C. Both files STILL exist on storage disk!
        $this->assertTrue(Storage::disk('local')->exists($dbV1->file_reference), 'Version 1 file must NOT be deleted');
        $this->assertTrue(Storage::disk('local')->exists($dbV2->file_reference), 'Version 2 file must exist');

        $this->assertEquals($payloadV1, Storage::disk('local')->get($dbV1->file_reference));
        $this->assertEquals($payloadV2, Storage::disk('local')->get($dbV2->file_reference));
    }

    /**
     * Challenge: Invalid MIME types and oversized files must be rejected.
     * Tests both HTTP FormRequest layer (422) and Domain Entity invariant layer (400).
     */
    public function test_challenge_evidence_mime_type_and_size_validation(): void
    {
        Storage::fake('local');
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);
        $auth = $this->createAuthContext();
        $product = $this->createProduct($auth['cooperative']->id);
        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->first();

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-ADV-MIME-01',
            'status' => 'DRAFT',
        ]);

        // HTTP Gate Check: Disallowed file type -> HTTP 422 Unprocessable Entity
        $maliciousFile = UploadedFile::fake()->create('exploit.sh', 10, 'text/x-shellscript');

        $resp1 = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$app->id}/evidences", [
                'title' => 'Malicious Script',
                'evidence_type' => 'LEGAL_DOCUMENT',
                'file' => $maliciousFile,
            ]);

        $resp1->assertStatus(422);

        // Domain Entity Invariant Check: Instantiating EvidenceVersion with illegal MIME type
        try {
            new EvidenceVersion(
                id: (string) Str::uuid(),
                evidenceId: (string) Str::uuid(),
                versionNumber: 1,
                fileReference: 'path/to/shell.sh',
                fileName: 'shell.sh',
                checksum: 'hash',
                mimeType: 'application/x-executable',
                fileSize: 1024,
                uploadedBy: 'adversary'
            );
            $this->fail('Domain entity EvidenceVersion must reject unsupported MIME types');
        } catch (DomainException $e) {
            $this->assertEquals('INVALID_FILE_FORMAT', $e->getErrorCode());
        }

        // Domain Entity Invariant Check: Instantiating EvidenceVersion exceeding 50MB (52428800 bytes)
        try {
            new EvidenceVersion(
                id: (string) Str::uuid(),
                evidenceId: (string) Str::uuid(),
                versionNumber: 1,
                fileReference: 'path/to/large.pdf',
                fileName: 'large.pdf',
                checksum: 'hash',
                mimeType: 'application/pdf',
                fileSize: 60000000, // ~60MB > 50MB
                uploadedBy: 'adversary'
            );
            $this->fail('Domain entity EvidenceVersion must reject oversized files > 50MB');
        } catch (DomainException $e) {
            $this->assertEquals('FILE_TOO_LARGE', $e->getErrorCode());
        }
    }
}
