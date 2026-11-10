<?php

namespace Tests\Feature\Agriculture;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\LotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\MemberPlotAssignmentModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Finance\Infrastructure\Persistence\Models\ReceivablePayableModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Tests\TestCase;

class AgricultureNewFeaturesTest extends TestCase
{
    private function createCooperative(?string $code = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'HTX_TEST_'.strtoupper(Str::random(4)),
            'legal_name' => 'HTX Nông Nghiệp Tân Tiến',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop, array $perms = []): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_TEST_'.strtoupper(Str::random(4)),
            'name' => 'Test Role',
        ]);

        $defaultPerms = ['AGRICULTURE.CREATE', 'AGRICULTURE.READ', 'AGRICULTURE.UPDATE', 'FINANCE.CREATE', 'FINANCE.READ'];
        $allPerms = array_unique(array_merge($defaultPerms, $perms));

        foreach ($allPerms as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm '.$pCode, 'module' => 'Agriculture']
            );
            $role->permissions()->attach($permission->id);
        }

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'user_'.Str::random(6),
            'email' => 'user_'.Str::random(6).'@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Kỹ Sư Nông Nghiệp',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    private function createAgricultureContext(CooperativeModel $coop): array
    {
        $unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'unit_code' => 'PUC-49-015-'.strtoupper(Str::random(4)),
            'name' => 'Vùng Trồng Ớt Chuông Sweet Palermo Hòn Bồ',
            'crop' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'area' => 50.0,
            'status' => 'ACTIVE',
            'registration_information' => [
                'vietgap' => [
                    'cert_number' => 'VIETGAP-TT-2024-089',
                    'issuer' => 'Sở NN&PTNT Lâm Đồng',
                    'valid_until' => '2027-12-31',
                ],
            ],
        ]);

        $plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => 'PLOT-TT-01',
            'area' => 2500,
            'status' => 'ACTIVE',
            'land_relation' => [
                'gps_coordinates' => '11.9404, 108.4583',
                'latitude' => 11.9404,
                'longitude' => 108.4583,
            ],
        ]);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
            'crop' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'start_date' => '2026-08-01',
            'expected_end_date' => '2026-12-31',
            'status' => 'ACTIVE',
        ]);

        return ['unit' => $unit, 'plot' => $plot, 'season' => $season];
    }

    // =========================================================================
    // TASK 1: AUTO-LOOKUP PHI_DAYS FROM MATERIAL CATALOG
    // =========================================================================

    public function test_auto_lookup_phi_days_from_material_catalog_when_omitted(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createAgricultureContext($coop);

        // Material with configured phi_days in safety_information
        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'MAT-NEEM-BIO',
            'name' => 'Thuốc trừ sâu sinh học Neem Oil',
            'category' => 'PESTICIDE',
            'unit' => 'LIT',
            'safety_information' => ['phi_days' => 14],
            'status' => 'ACTIVE',
        ]);

        // Post farming log without phi_days
        $payload = [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-01',
            'material_id' => $material->id,
            'quantity_applied' => 10.0,
            'unit' => 'LIT',
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
            // 'phi_days' omitted!
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.phi_days', 14);

        // Verify farming_logs table has phi_days auto-populated as 14
        $this->assertDatabaseHas('farming_logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'material_id' => $material->id,
            'phi_days' => 14,
        ]);

        // Verify PhiCalculationModel created with safety date: 2026-09-01 + 14 = 2026-09-15
        $this->assertDatabaseHas('phi_calculations', [
            'material_id' => $material->id,
            'configured_phi_days' => 14,
            'safety_date' => '2026-09-15',
            'status' => 'ACTIVE',
        ]);

        // Verify plot is quarantined until 2026-09-15
        $this->assertDatabaseHas('farm_plots', [
            'id' => $ctx['plot']->id,
            'status' => 'IN_QUARANTINE',
            'quarantine_until' => '2026-09-15',
        ]);
    }

    // =========================================================================
    // TASK 2: 3-TIER KCS INSPECTION LOGIC FOR HARVEST
    // =========================================================================

    public function test_kcs_gate_check_enforces_phi_safety_and_blocks_violation(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createAgricultureContext($coop);

        $mat = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'MAT-GATE-01',
            'name' => 'Thuốc trừ sâu sinh học',
            'category' => 'PESTICIDE',
            'unit' => 'LIT',
            'safety_information' => ['phi_days' => 10],
            'status' => 'ACTIVE',
        ]);

        // Spray on 2026-09-01 with PHI 10 days -> safe on 2026-09-11
        $log = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'material_id' => $mat->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-01',
            'phi_days' => 10,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        PhiCalculationModel::create([
            'id' => (string) Str::uuid(),
            'farming_log_id' => $log->id,
            'material_id' => $mat->id,
            'application_date' => '2026-09-01',
            'configured_phi_days' => 10,
            'safety_date' => '2026-09-11',
            'status' => 'ACTIVE',
        ]);

        // Harvest on valid date: 2026-09-15
        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-15',
            'quantity' => 1200.0,
            'unit' => 'KG',
            'kcs_status' => 'PENDING_KCS',
        ]);

        // Gate check on valid date -> passes
        $gateRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest->id}/kcs/gate-check", [
            'note' => 'Kiểm tra cổng nông trường đạt chuẩn',
        ]);

        $gateRes->assertStatus(200);
        $gateRes->assertJsonPath('data.kcs_status', 'GATE_PASSED');
        $gateRes->assertJsonPath('data.kcs_gate_check.passed', true);

        // Gate check attempting date before safe date (e.g. 2026-09-05) -> must throw ERR_HARVEST_PHI_VIOLATION (400)
        $gateFailRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest->id}/kcs/gate-check", [
            'harvest_date' => '2026-09-05',
        ]);

        $gateFailRes->assertStatus(400);
        $gateFailRes->assertJsonPath('error.code', 'ERR_HARVEST_PHI_VIOLATION');
    }

    public function test_kcs_quick_lab_passed_and_rejected(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createAgricultureContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-01',
            'quantity' => 1500.0,
            'unit' => 'KG',
        ]);

        // 1. Record LAB_PASSED
        $labRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest->id}/kcs/quick-lab", [
            'status' => 'LAB_PASSED',
            'test_kit' => 'KIT-CHLOR-2026',
            'ppm' => 0.002,
            'active_substances_tested' => ['Chlorpyrifos', 'Imidacloprid'],
            'tester_name' => 'KCS Lab Tân Tiến',
        ]);

        $labRes->assertStatus(200);
        $labRes->assertJsonPath('data.kcs_status', 'LAB_PASSED');
        $labRes->assertJsonPath('data.kcs_quick_lab.test_kit', 'KIT-CHLOR-2026');
        $labRes->assertJsonPath('data.kcs_quick_lab.ppm', 0.002);

        // 2. Record LAB_REJECTED on another harvest
        $harvestReject = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-02',
            'quantity' => 800.0,
            'unit' => 'KG',
        ]);

        $rejectRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvestReject->id}/kcs/quick-lab", [
            'status' => 'LAB_REJECTED',
            'test_kit' => 'KIT-PEST-FAIL',
            'ppm' => 0.085,
        ]);

        $rejectRes->assertStatus(200);
        $rejectRes->assertJsonPath('data.kcs_status', 'LAB_REJECTED');
        $rejectRes->assertJsonPath('data.grade', 'REJECT');
        $this->assertEquals(800.0, (float) $rejectRes->json('data.reject_kg'));
    }

    public function test_kcs_grading_classifies_grade_a_and_grade_b_correctly(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createAgricultureContext($coop);

        // Harvest 1: Uniformity >= 90% and Brix >= 7 -> Grade A
        $harvest1 = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-05',
            'quantity' => 1000.0,
            'unit' => 'KG',
            'kcs_status' => 'LAB_PASSED',
        ]);

        $gradeARes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest1->id}/kcs/grading", [
            'brix_level' => 7.8,
            'uniformity_rate' => 93.0,
        ]);

        $gradeARes->assertStatus(200);
        $gradeARes->assertJsonPath('data.grade', 'GRADE_A');
        $gradeARes->assertJsonPath('data.brix_level', 7.8);
        $gradeARes->assertJsonPath('data.uniformity_rate', 93);
        $gradeARes->assertJsonPath('data.grade_a_kg', 1000);
        $gradeARes->assertJsonPath('data.grade_b_kg', 0);
        $gradeARes->assertJsonPath('data.reject_kg', 0);

        // Harvest 2: Brix < 7 (e.g. 6.5) -> Demoted to Grade B
        $harvest2 = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-06',
            'quantity' => 600.0,
            'unit' => 'KG',
            'kcs_status' => 'LAB_PASSED',
        ]);

        $gradeBRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest2->id}/kcs/grading", [
            'brix_level' => 6.5,
            'uniformity_rate' => 94.0,
        ]);

        $gradeBRes->assertStatus(200);
        $gradeBRes->assertJsonPath('data.grade', 'GRADE_B');
        $gradeBRes->assertJsonPath('data.grade_a_kg', 0);
        $gradeBRes->assertJsonPath('data.grade_b_kg', 600);

        // Harvest 3: Uniformity < 90% (e.g. 85%) -> Demoted to Grade B
        $harvest3 = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-07',
            'quantity' => 500.0,
            'unit' => 'KG',
            'kcs_status' => 'LAB_PASSED',
        ]);

        $gradeBRes2 = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest3->id}/kcs/grading", [
            'brix_level' => 8.2,
            'uniformity_rate' => 85.0,
        ]);

        $gradeBRes2->assertStatus(200);
        $gradeBRes2->assertJsonPath('data.grade', 'GRADE_B');
        $gradeBRes2->assertJsonPath('data.grade_b_kg', 500);
    }

    // =========================================================================
    // TASK 3: FINANCE SETTLEMENT / HARVEST INTEGRATION
    // =========================================================================

    public function test_finance_harvest_settlement_aggregation_and_debt_offset(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createAgricultureContext($coop);

        // Create Member
        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'MB-TT-012',
            'identity_information' => ['full_name' => 'Nguyễn Văn Nông Dân', 'phone' => '0912345678'],
            'member_type' => 'REGULAR',
            'credit_limit' => 50000000.0,
            'status' => 'ACTIVE',
        ]);

        // Assign member to plot
        MemberPlotAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $member->id,
            'plot_id' => $ctx['plot']->id,
            'assignment_type' => 'PRIMARY',
            'start_date' => '2026-08-01',
            'status' => 'ACTIVE',
        ]);

        // Member has warehouse advance credit debt of 10,000,000 VNĐ
        $debt = ReceivablePayableModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'debt_code' => 'CN-VT-2026-012',
            'debt_type' => 'RECEIVABLE',
            'counterparty_type' => 'MEMBER',
            'counterparty_id' => $member->id,
            'counterparty_name' => 'Nguyễn Văn Nông Dân',
            'original_amount' => 10000000.0,
            'outstanding_amount' => 10000000.0,
            'due_date' => '2026-11-30',
            'status' => 'OPEN',
            'description' => 'Xuất ứng vật tư phân bón giống trả chậm đầu vụ',
        ]);

        // Harvest 1: Grade A, 1000 kg
        HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-10',
            'quantity' => 1000.0,
            'unit' => 'KG',
            'grade' => 'GRADE_A',
            'quality_information' => [
                'grade_a_kg' => 1000.0,
                'grade_b_kg' => 0.0,
                'reject_kg' => 0.0,
            ],
            'kcs_status' => 'GRADED',
        ]);

        // Harvest 2: Grade B, 500 kg
        HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-15',
            'quantity' => 500.0,
            'unit' => 'KG',
            'grade' => 'GRADE_B',
            'quality_information' => [
                'grade_a_kg' => 0.0,
                'grade_b_kg' => 500.0,
                'reject_kg' => 0.0,
            ],
            'kcs_status' => 'GRADED',
        ]);

        // Total Value calculation:
        // Grade A = 1000 kg * 35,000 = 35,000,000 VNĐ
        // Grade B = 500 kg * 25,000 = 12,500,000 VNĐ
        // Total Produce Value = 47,500,000 VNĐ
        // Fee (2.5%) = 1,187,500 VNĐ
        // Remaining after fee = 46,312,500 VNĐ
        // Debt deduction = 10,000,000 VNĐ
        // Net payout = 36,312,500 VNĐ

        $settleRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests/settle-season', [
            'season_id' => $ctx['season']->id,
            'member_id' => $member->id,
            'grade_a_price' => 35000,
            'grade_b_price' => 25000,
            'service_fee_rate' => 0.025,
        ]);

        $settleRes->assertStatus(200);
        $settleRes->assertJsonPath('data.total_grade_a_kg', 1000);
        $settleRes->assertJsonPath('data.total_grade_b_kg', 500);
        $settleRes->assertJsonPath('data.gross_produce_value', 47500000);
        $settleRes->assertJsonPath('data.service_fee', 1187500);
        $settleRes->assertJsonPath('data.total_debt_offset', 10000000);
        $settleRes->assertJsonPath('data.net_payout', 36312500);
        $settleRes->assertJsonPath('data.remaining_member_debt', 0);

        // Verify debt is SETTLED
        $freshDebt = $debt->fresh();
        $this->assertEquals(0.0, (float) $freshDebt->outstanding_amount);
        $this->assertEquals('SETTLED', $freshDebt->status);

        // Verify DebtSettlement recorded
        $this->assertDatabaseHas('debt_settlements', [
            'debt_id' => $debt->id,
            'payment_method' => 'HARVEST_OFFSET',
            'amount' => 10000000.0,
        ]);

        // Verify cash expense payment voucher created
        $this->assertDatabaseHas('cash_transactions', [
            'member_id' => $member->id,
            'amount' => 36312500.0,
            'category' => 'QUYET_TOAN_MUA_VU',
        ]);
    }

    // =========================================================================
    // TASK 4: PUBLIC TRACEABILITY API
    // =========================================================================

    public function test_public_traceability_dossier_by_uuid_and_lot_code_unauthenticated(): void
    {
        $coop = $this->createCooperative('TT-DALAT');
        $ctx = $this->createAgricultureContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-20',
            'quantity' => 2000.0,
            'unit' => 'KG',
            'grade' => 'GRADE_A',
            'brix_level' => 7.8,
            'uniformity_rate' => 92.5,
            'kcs_status' => 'GRADED',
            'kcs_gate_check' => ['passed' => true, 'note' => 'Gate passed'],
            'kcs_quick_lab' => ['status' => 'LAB_PASSED', 'test_kit' => 'KIT-01', 'ppm' => 0.001],
            'quality_information' => [
                'grade_a_kg' => 2000.0,
                'grade_b_kg' => 0.0,
                'reject_kg' => 0.0,
            ],
        ]);

        $lot = LotModel::create([
            'id' => (string) Str::uuid(),
            'lot_code' => 'LOT-TT-PLOT01-20261020-001',
            'harvest_id' => $harvest->id,
            'quantity' => 2000.0,
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        // 1. Query by UUID WITHOUT authentication (no Sanctum token)
        $resByUuid = $this->getJson("/api/v1/public/trace/{$lot->id}");

        $resByUuid->assertStatus(200);
        $resByUuid->assertJsonPath('success', true);
        $resByUuid->assertJsonPath('data.lot_code', 'LOT-TT-PLOT01-20261020-001');
        $resByUuid->assertJsonPath('data.cooperative.name', 'HTX Nông Nghiệp Tân Tiến');
        $resByUuid->assertJsonPath('data.cooperative.province', 'Lâm Đồng');
        $resByUuid->assertJsonPath('data.product.name', 'Ớt chuông Sweet Palermo Đỏ Đà Lạt');
        $resByUuid->assertJsonPath('data.product.grade', 'GRADE_A');
        $resByUuid->assertJsonPath('data.product.brix_level', 7.8);
        $resByUuid->assertJsonPath('data.product.uniformity_rate', 92.5);
        $resByUuid->assertJsonPath('data.plot.plot_code', 'PLOT-TT-01');
        $resByUuid->assertJsonPath('data.plot.gps_coordinates', '11.9404, 108.4583');
        $resByUuid->assertJsonPath('data.kcs_inspection.gate_check', 'PASSED');
        $resByUuid->assertJsonPath('data.kcs_inspection.quick_lab', 'LAB_PASSED');
        $resByUuid->assertJsonPath('data.kcs_inspection.brix_level', 7.8);
        $resByUuid->assertJsonPath('data.kcs_inspection.uniformity_rate', 92.5);

        // Verify 5-stage farming journey exists
        $journey = $resByUuid->json('data.farming_journey');
        $this->assertCount(5, $journey);
        $this->assertEquals(1, $journey[0]['stage_number']);
        $this->assertEquals(5, $journey[4]['stage_number']);

        // Verify certifications
        $certs = $resByUuid->json('data.certifications');
        $this->assertNotEmpty($certs);
        $certNames = collect($certs)->pluck('badge_label')->all();
        $this->assertContains('VietGAP', $certNames);
        $this->assertContains('OCOP 4 Sao', $certNames);

        // Verify SHA-256 integrity hash is a genuine 64-character hex string
        $hash = $resByUuid->json('data.integrity_hash');
        $this->assertNotNull($hash);
        $this->assertEquals(64, strlen($hash));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $hash);

        // 2. Query by lot_code WITHOUT authentication
        $resByCode = $this->getJson('/api/v1/public/trace/LOT-TT-PLOT01-20261020-001');
        $resByCode->assertStatus(200);
        $resByCode->assertJsonPath('data.lot_id', $lot->id);
        $resByCode->assertJsonPath('data.integrity_hash', $hash);

        // 3. Query non-existent lot returns 404
        $resNotFound = $this->getJson('/api/v1/public/trace/LOT-NON-EXISTENT');
        $resNotFound->assertStatus(404);
    }
}
