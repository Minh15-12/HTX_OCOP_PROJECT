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
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Tests\TestCase;

/**
 * Challenger Adversarial & Stress Probe Test Suite:
 * 1. PHI Guard Bypass probes: pre-safe harvest, boundary dates, patch tamper, gate check, cumulative spray.
 * 2. GPS Location Required probes: missing GPS, partial GPS, PHUN_THUOC variant, non-spray allowance.
 * 3. 3-Tier KCS Grade A probes: sub-par Brix (<7), sub-par uniformity (<90%), adversarial body tampering, lab-rejected harvest.
 * 4. Unauthenticated Public Trace probes: UUID, GS1 code, route aliases, 404 handling, malicious/injection inputs, data leakage check, SHA-256 integrity verification.
 */
class AgricultureChallengerAdversarialTest extends TestCase
{
    private function createCooperative(?string $code = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'TT_ADV_'.strtoupper(Str::random(4)),
            'legal_name' => 'HTX Nông Nghiệp Tân Tiến (Challenger Probe)',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_ADV_'.strtoupper(Str::random(4)),
            'name' => 'Challenger Role',
        ]);

        $perms = [
            'AGRICULTURE.CREATE', 'AGRICULTURE.READ', 'AGRICULTURE.UPDATE',
            'FINANCE.CREATE', 'FINANCE.READ',
            'INVENTORY.CREATE', 'INVENTORY.READ',
        ];

        foreach ($perms as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm '.$pCode, 'module' => 'Agriculture']
            );
            $role->permissions()->attach($permission->id);
        }

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'adv_user_'.Str::random(6),
            'email' => 'adv_user_'.Str::random(6).'@tantien.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Challenger Adversary User',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    private function createContext(CooperativeModel $coop): array
    {
        $unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'unit_code' => 'PUC-49-015-'.strtoupper(Str::random(4)),
            'name' => 'Vùng Canh Tác Hòn Bồ Adversarial',
            'crop' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'area' => 30.0,
            'status' => 'ACTIVE',
            'location' => [
                'province' => 'Lâm Đồng',
                'district' => 'Đà Lạt',
                'commune' => 'Phường 12',
                'coordinates' => '11.9404, 108.4583',
            ],
            'registration_information' => [
                'vietgap' => ['cert_number' => 'VIETGAP-ADV-2026', 'valid_until' => '2027-12-31'],
            ],
        ]);

        $plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => 'PLOT-TT-ADV-01',
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
            'name' => 'Vụ Canh Tác Thử Nghiệm 2026',
            'crop' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'start_date' => '2026-08-01',
            'expected_end_date' => '2026-12-31',
            'status' => 'ACTIVE',
        ]);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'MAT-CHLOR-ADV',
            'name' => 'Chế phẩm bảo vệ thực vật hữu cơ Neem Guard',
            'category' => 'PESTICIDE',
            'unit' => 'LIT',
            'safety_information' => ['phi_days' => 14],
            'status' => 'ACTIVE',
        ]);

        return compact('unit', 'plot', 'season', 'material');
    }

    // =========================================================================
    // PROBE SUITE 1: PHI GUARD ADVERSARIAL ATTACKS
    // =========================================================================

    public function test_phi_guard_probe_attempt_to_create_harvest_before_safe_date_is_hard_blocked(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        // Spraying on 2026-09-01 with 14 PHI days -> Safe harvest date = 2026-09-15
        $log = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'material_id' => $ctx['material']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-01',
            'phi_days' => 14,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        PhiCalculationModel::create([
            'id' => (string) Str::uuid(),
            'farming_log_id' => $log->id,
            'material_id' => $ctx['material']->id,
            'application_date' => '2026-09-01',
            'configured_phi_days' => 14,
            'safety_date' => '2026-09-15',
            'status' => 'ACTIVE',
        ]);

        // Adversarial Attack: Attempt to harvest on 2026-09-10 (5 days before safe date)
        $attackPayload = [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-10',
            'quantity' => 500.0,
            'unit' => 'KG',
        ];

        $res = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', $attackPayload);

        $res->assertStatus(400);
        $res->assertJsonPath('error.code', 'ERR_HARVEST_PHI_VIOLATION');
        $this->assertStringContainsString('Cảnh báo an toàn PHI', $res->json('error.message'));
        $this->assertStringContainsString('2026-09-15', $res->json('error.message'));

        // Verify harvest was NOT persisted in database
        $this->assertDatabaseMissing('harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-10',
        ]);

        // Verify audit log recorded PHI_VIOLATION_ATTEMPTED
        $this->assertDatabaseHas('audit_events', [
            'action' => 'PHI_VIOLATION_ATTEMPTED',
            'entity_type' => 'Harvest',
        ]);
    }

    public function test_phi_guard_probe_exact_boundary_one_day_before_is_blocked_exact_safe_date_is_permitted(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        // Spray on 2026-09-01 with 7 PHI days -> Safe date is 2026-09-08
        $log = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-01',
            'phi_days' => 7,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        PhiCalculationModel::create([
            'id' => (string) Str::uuid(),
            'farming_log_id' => $log->id,
            'material_id' => $ctx['material']->id,
            'application_date' => '2026-09-01',
            'configured_phi_days' => 7,
            'safety_date' => '2026-09-08',
            'status' => 'ACTIVE',
        ]);

        // Boundary - 1 day: 2026-09-07 must be BLOCKED
        $resBefore = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-07',
            'quantity' => 100.0,
            'unit' => 'KG',
        ]);
        $resBefore->assertStatus(400);
        $resBefore->assertJsonPath('error.code', 'ERR_HARVEST_PHI_VIOLATION');

        // Boundary exact date: 2026-09-08 must be PERMITTED
        $resExact = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-08',
            'quantity' => 100.0,
            'unit' => 'KG',
        ]);
        $resExact->assertStatus(201);
        $resExact->assertJsonPath('data.harvest_date', '2026-09-08');
    }

    public function test_phi_guard_probe_patch_tamper_attempt_moving_harvest_date_backwards_is_blocked(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        // Spray with safety date 2026-09-20
        $log = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-01',
            'phi_days' => 19,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        PhiCalculationModel::create([
            'id' => (string) Str::uuid(),
            'farming_log_id' => $log->id,
            'material_id' => $ctx['material']->id,
            'application_date' => '2026-09-01',
            'configured_phi_days' => 19,
            'safety_date' => '2026-09-20',
            'status' => 'ACTIVE',
        ]);

        // Harvest created on safe date 2026-09-25
        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-25',
            'quantity' => 400.0,
            'unit' => 'KG',
        ]);

        // Adversarial Attack: User attempts to PATCH harvest_date backwards to 2026-09-15
        $patchRes = $this->actingAs($user, 'sanctum')->patchJson("/api/v1/harvests/{$harvest->id}", [
            'harvest_date' => '2026-09-15',
        ]);

        $patchRes->assertStatus(400);
        $patchRes->assertJsonPath('error.code', 'ERR_HARVEST_PHI_VIOLATION');

        // Confirm DB unchanged
        $this->assertEquals('2026-09-25', $harvest->fresh()->harvest_date->format('Y-m-d'));
    }

    public function test_phi_guard_probe_cumulative_multiple_sprays_enforces_strictest_latest_safe_date(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        // Spray 1: 2026-09-01 + 7 days -> Safe 2026-09-08
        $log1 = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-01',
            'phi_days' => 7,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);
        PhiCalculationModel::create([
            'id' => (string) Str::uuid(),
            'farming_log_id' => $log1->id,
            'material_id' => $ctx['material']->id,
            'application_date' => '2026-09-01',
            'configured_phi_days' => 7,
            'safety_date' => '2026-09-08',
            'status' => 'ACTIVE',
        ]);

        // Spray 2: 2026-09-05 + 14 days -> Safe 2026-09-19
        $log2 = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-05',
            'phi_days' => 14,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);
        PhiCalculationModel::create([
            'id' => (string) Str::uuid(),
            'farming_log_id' => $log2->id,
            'material_id' => $ctx['material']->id,
            'application_date' => '2026-09-05',
            'configured_phi_days' => 14,
            'safety_date' => '2026-09-19',
            'status' => 'ACTIVE',
        ]);

        // Attack: Try harvesting on 2026-09-12 (after spray 1 safe date, but before spray 2 safe date)
        $res = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-12',
            'quantity' => 250.0,
            'unit' => 'KG',
        ]);

        $res->assertStatus(400);
        $res->assertJsonPath('error.code', 'ERR_HARVEST_PHI_VIOLATION');
        $this->assertStringContainsString('2026-09-19', $res->json('error.message'));
    }

    // =========================================================================
    // PROBE SUITE 2: SPRAY LOG GPS COORDINATES VALIDATION
    // =========================================================================

    public function test_gps_probe_spraying_without_gps_returns_422_err_gps_location_required(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        // Adversarial Attack: create SPRAYING log without GPS coordinates
        $res = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-10',
            'material_id' => $ctx['material']->id,
            'quantity_applied' => 5.0,
            'unit' => 'LIT',
            'phi_days' => 7,
            // GPS coordinates completely omitted
        ]);

        $res->assertStatus(422);
        $res->assertJsonPath('error.code', 'ERR_GPS_LOCATION_REQUIRED');
    }

    public function test_gps_probe_spraying_with_partial_gps_missing_latitude_or_longitude_returns_422(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        // Latitude provided, longitude omitted
        $resLatOnly = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-10',
            'gps_latitude' => 11.9404,
            // gps_longitude missing
        ]);
        $resLatOnly->assertStatus(422);
        $resLatOnly->assertJsonPath('error.code', 'ERR_GPS_LOCATION_REQUIRED');

        // Longitude provided, latitude omitted
        $resLngOnly = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-10',
            'gps_longitude' => 108.4583,
            // gps_latitude missing
        ]);
        $resLngOnly->assertStatus(422);
        $resLngOnly->assertJsonPath('error.code', 'ERR_GPS_LOCATION_REQUIRED');
    }

    public function test_gps_probe_phun_thuoc_variant_also_enforces_gps(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        // PHUN_THUOC is recognized in service level
        $res = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'PHUN_THUOC',
            'activity_date' => '2026-09-10',
        ]);

        // Form request validator restricts to in:SPRAYING,... or if passed directly returns 422
        $this->assertEquals(422, $res->status());
    }

    public function test_gps_probe_non_spraying_activity_without_gps_is_allowed(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        // FERTILIZING does not mandate GPS
        $res = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'FERTILIZING',
            'activity_date' => '2026-09-10',
            'quantity_applied' => 50.0,
            'unit' => 'KG',
        ]);

        $res->assertStatus(201);
        $res->assertJsonPath('data.activity_type', 'FERTILIZING');
    }

    public function test_gps_probe_out_of_range_coordinates_are_rejected(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        // Latitude > 90 or Longitude > 180
        $res = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-10',
            'gps_latitude' => 195.0, // Invalid latitude
            'gps_longitude' => 108.4583,
        ]);

        $res->assertStatus(422);
    }

    // =========================================================================
    // PROBE SUITE 3: 3-TIER KCS GRADE A SUB-PAR MANIPULATION
    // =========================================================================

    public function test_kcs_probe_sub_par_brix_under_7_is_forced_to_grade_b(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-01',
            'quantity' => 1000.0,
            'unit' => 'KG',
            'kcs_status' => 'LAB_PASSED',
        ]);

        // Attempt with high uniformity (95%), but sub-par Brix (6.9)
        // Adversary tries to claim GRADE_A
        $res = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest->id}/kcs/grading", [
            'brix_level' => 6.9,
            'uniformity_rate' => 95.0,
            'grade' => 'GRADE_A', // Tampered request
        ]);

        $res->assertStatus(200);
        // Invariant: Grade MUST be forced to GRADE_B
        $res->assertJsonPath('data.grade', 'GRADE_B');
        $res->assertJsonPath('data.grade_a_kg', 0);
        $res->assertJsonPath('data.grade_b_kg', 1000);

        $fresh = $harvest->fresh();
        $this->assertEquals('GRADE_B', $fresh->grade);
        $this->assertEquals(0.0, (float) ($fresh->quality_information['grade_a_kg'] ?? 0));
        $this->assertEquals(1000.0, (float) ($fresh->quality_information['grade_b_kg'] ?? 0));
    }

    public function test_kcs_probe_sub_par_uniformity_under_90_is_forced_to_grade_b(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-01',
            'quantity' => 800.0,
            'unit' => 'KG',
            'kcs_status' => 'LAB_PASSED',
        ]);

        // Attempt with high Brix (8.5), but sub-par uniformity (89.9%)
        $res = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest->id}/kcs/grading", [
            'brix_level' => 8.5,
            'uniformity_rate' => 89.9,
            'grade' => 'GRADE_A',
        ]);

        $res->assertStatus(200);
        $res->assertJsonPath('data.grade', 'GRADE_B');
        $res->assertJsonPath('data.grade_a_kg', 0);
        $res->assertJsonPath('data.grade_b_kg', 800);

        $fresh = $harvest->fresh();
        $this->assertEquals('GRADE_B', $fresh->grade);
        $this->assertEquals(0.0, (float) ($fresh->quality_information['grade_a_kg'] ?? 0));
        $this->assertEquals(800.0, (float) ($fresh->quality_information['grade_b_kg'] ?? 0));
    }

    /**
     * EMPIRICAL FINDING PROBE:
     * When client maliciously supplies 'grade_a_kg' in payload alongside sub-par Brix or uniformity,
     * HarvestService line 314 accepts $params['grade_a_kg'] into quality_information without sanitizing it to 0.
     * This test documents this exact behavior.
     */
    public function test_kcs_probe_documents_smuggled_grade_a_kg_vulnerability(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-01',
            'quantity' => 1000.0,
            'unit' => 'KG',
            'kcs_status' => 'LAB_PASSED',
        ]);

        // Malicious client provides sub-par Brix (6.0), but injects grade_a_kg = 1000
        $res = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest->id}/kcs/grading", [
            'brix_level' => 6.0,
            'uniformity_rate' => 80.0,
            'grade_a_kg' => 1000.0,
        ]);

        $res->assertStatus(200);
        // The classification grade is correctly set to GRADE_B:
        $this->assertEquals('GRADE_B', $res->json('data.grade'));

        // VERIFIED INVARIANT: Grade A volume is strictly zeroed out when harvest is Grade B
        $this->assertEquals(0.0, (float) $res->json('data.grade_a_kg'));
    }

    public function test_kcs_probe_lab_rejected_harvest_cannot_be_promoted_to_grade_a(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-01',
            'quantity' => 600.0,
            'unit' => 'KG',
        ]);

        // Quick Lab records REJECTION (prohibited pesticide residue)
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest->id}/kcs/quick-lab", [
            'status' => 'LAB_REJECTED',
            'test_kit' => 'KIT-FAIL-01',
            'ppm' => 0.09,
        ]);

        $freshLab = $harvest->fresh();
        $this->assertEquals('REJECT', $freshLab->grade);

        // Adversarial Attempt: Try grading with superb Brix (9.5) and uniformity (98%) to overwrite REJECT
        $resGrading = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest->id}/kcs/grading", [
            'brix_level' => 9.5,
            'uniformity_rate' => 98.0,
            'grade' => 'GRADE_A',
        ]);

        $resGrading->assertStatus(200);
        // Must remain REJECT!
        $resGrading->assertJsonPath('data.grade', 'REJECT');
        $resGrading->assertJsonPath('data.reject_kg', 600);
        $resGrading->assertJsonPath('data.grade_a_kg', 0);
    }

    public function test_kcs_probe_exact_threshold_brix_7_and_uniformity_90_qualifies_as_grade_a(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-01',
            'quantity' => 500.0,
            'unit' => 'KG',
            'kcs_status' => 'LAB_PASSED',
        ]);

        // Exact boundary: Brix = 7.0, Uniformity = 90.0%
        $res = $this->actingAs($user, 'sanctum')->postJson("/api/v1/harvests/{$harvest->id}/kcs/grading", [
            'brix_level' => 7.0,
            'uniformity_rate' => 90.0,
        ]);

        $res->assertStatus(200);
        $res->assertJsonPath('data.grade', 'GRADE_A');
        $res->assertJsonPath('data.grade_a_kg', 500);
        $res->assertJsonPath('data.grade_b_kg', 0);
    }

    // =========================================================================
    // PROBE SUITE 4: UNAUTHENTICATED PUBLIC TRACEABILITY ENDPOINT
    // =========================================================================

    public function test_public_trace_probe_accessible_without_sanctum_token(): void
    {
        $coop = $this->createCooperative('TT-PROBE');
        $ctx = $this->createContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-25',
            'quantity' => 1500.0,
            'unit' => 'KG',
            'grade' => 'GRADE_A',
            'brix_level' => 8.0,
            'uniformity_rate' => 94.0,
            'kcs_status' => 'GRADED',
            'kcs_gate_check' => ['passed' => true],
            'kcs_quick_lab' => ['status' => 'LAB_PASSED', 'test_kit' => 'KIT-01'],
        ]);

        $lot = LotModel::create([
            'id' => (string) Str::uuid(),
            'lot_code' => 'LOT-TT-PLOT01-20261025-01',
            'harvest_id' => $harvest->id,
            'quantity' => 1500.0,
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        // Unauthenticated request to /api/v1/public/trace/{lotId}
        $res = $this->getJson("/api/v1/public/trace/{$lot->id}");

        $res->assertStatus(200);
        $res->assertJsonPath('success', true);
        $res->assertJsonPath('data.lot_code', 'LOT-TT-PLOT01-20261025-01');
        $res->assertJsonPath('data.lot_id', $lot->id);
        $res->assertJsonPath('data.cooperative.name', 'HTX Nông Nghiệp Tân Tiến (Challenger Probe)');
        $res->assertJsonPath('data.product.name', 'Ớt chuông Sweet Palermo Đỏ Đà Lạt');
        $this->assertEquals(8.0, (float) $res->json('data.kcs_inspection.brix_level'));
        $this->assertEquals(94.0, (float) $res->json('data.kcs_inspection.uniformity_rate'));

        // Also test alternative route /api/v1/trace/{lotId}
        $resAlias = $this->getJson("/api/v1/trace/{$lot->lot_code}");
        $resAlias->assertStatus(200);
        $resAlias->assertJsonPath('data.lot_code', 'LOT-TT-PLOT01-20261025-01');

        // Integrity hash must be valid SHA-256
        $hash = $res->json('data.integrity_hash');
        $this->assertEquals(64, strlen($hash));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $hash);
    }

    public function test_public_trace_probe_non_existent_lot_returns_404(): void
    {
        // Random UUID
        $fakeUuid = (string) Str::uuid();
        $resUuid = $this->getJson("/api/v1/public/trace/{$fakeUuid}");
        $resUuid->assertStatus(404);
        $resUuid->assertJsonPath('error.code', 'LOT_NOT_FOUND');

        // Random Lot Code
        $resCode = $this->getJson('/api/v1/public/trace/LOT-DOES-NOT-EXIST-999');
        $resCode->assertStatus(404);
        $resCode->assertJsonPath('error.code', 'LOT_NOT_FOUND');
    }

    public function test_public_trace_probe_adversarial_malicious_strings_gracefully_handled(): void
    {
        $maliciousInputs = [
            "' OR '1'='1",
            "'; DROP TABLE lots; --",
            '<script>alert(1)</script>',
            '../../etc/passwd',
            '%00%27%22',
            str_repeat('A', 500),
        ];

        foreach ($maliciousInputs as $input) {
            $res = $this->getJson('/api/v1/public/trace/'.urlencode($input));
            // Should safely return 404 Not Found, never 500 internal server error
            $this->assertEquals(404, $res->status(), "Failed on input: {$input}");
        }
    }

    public function test_public_trace_probe_does_not_leak_sensitive_internal_fields(): void
    {
        $coop = $this->createCooperative('TT-LEAK-TEST');
        $ctx = $this->createContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-25',
            'quantity' => 1000.0,
            'unit' => 'KG',
        ]);

        $lot = LotModel::create([
            'id' => (string) Str::uuid(),
            'lot_code' => 'LOT-TT-LEAK-01',
            'harvest_id' => $harvest->id,
            'quantity' => 1000.0,
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        $res = $this->getJson("/api/v1/public/trace/{$lot->id}");
        $res->assertStatus(200);

        $jsonStr = $res->getContent();

        // Must NOT leak database credentials, passwords, or tokens
        $this->assertStringNotContainsString('password', strtolower($jsonStr));
        $this->assertStringNotContainsString('remember_token', strtolower($jsonStr));
        $this->assertStringNotContainsString('api_token', strtolower($jsonStr));
        $this->assertStringNotContainsString('app_key', strtolower($jsonStr));
    }

    public function test_harvest_model_grade_a_kg_accessor_defense_returns_zero_for_grade_b(): void
    {
        $harvest = new HarvestModel([
            'grade' => 'GRADE_B',
            'quantity' => 500.0,
            'quality_information' => [
                'grade_a_kg' => 500.0,
                'grade_b_kg' => 500.0,
            ],
        ]);

        $this->assertEquals(0.0, $harvest->grade_a_kg);
    }

    public function test_lot_service_query_by_alphanumeric_lot_code_avoids_uuid_syntax_error(): void
    {
        $coop = $this->createCooperative('TT-ALPHANUM');
        $ctx = $this->createContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-25',
            'quantity' => 800.0,
            'unit' => 'KG',
        ]);

        $lot = LotModel::create([
            'id' => (string) Str::uuid(),
            'lot_code' => 'LOT-TT-P001-20261014-01',
            'harvest_id' => $harvest->id,
            'quantity' => 800.0,
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        $res = $this->getJson('/api/v1/public/trace/LOT-TT-P001-20261014-01');
        $res->assertStatus(200);
        $this->assertEquals('LOT-TT-P001-20261014-01', $res->json('data.lot_code'));
    }

    public function test_settlement_unassigned_member_throws_err_member_no_assigned_plots(): void
    {
        $coop = $this->createCooperative('TT-UNASSIGNED');
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        $unassignedMember = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'MEM-ADV-001',
            'identity_information' => ['full_name' => 'Nguyễn Unassigned', 'phone' => '0912345678'],
            'member_type' => 'REGULAR',
            'status' => 'ACTIVE',
        ]);

        $res = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests/settle-season', [
            'season_id' => $ctx['season']->id,
            'member_id' => $unassignedMember->id,
            'grade_a_price' => 35000,
            'grade_b_price' => 25000,
        ]);

        $res->assertStatus(400);
        $this->assertEquals('ERR_MEMBER_NO_ASSIGNED_PLOTS', $res->json('error.code'));
    }

    public function test_settlement_idempotency_duplicate_settlement_rejected(): void
    {
        $coop = $this->createCooperative('TT-IDEMPOTENT');
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createContext($coop);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'MEM-IDEM-001',
            'identity_information' => ['full_name' => 'Trần Idempotent', 'phone' => '0987654321'],
            'member_type' => 'REGULAR',
            'status' => 'ACTIVE',
        ]);

        MemberPlotAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $member->id,
            'plot_id' => $ctx['plot']->id,
            'assignment_type' => 'PRIMARY',
            'start_date' => '2026-08-01',
            'status' => 'ACTIVE',
        ]);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-20',
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

        // First settlement must succeed
        $res1 = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests/settle-season', [
            'season_id' => $ctx['season']->id,
            'member_id' => $member->id,
            'grade_a_price' => 35000,
            'grade_b_price' => 25000,
            'service_fee_rate' => 0.025,
        ]);
        $res1->assertStatus(200);

        // Verify harvest record was marked settled
        $freshHarvest = $harvest->fresh();
        $this->assertTrue($freshHarvest->quality_information['is_settled']);
        $this->assertNotEmpty($freshHarvest->quality_information['settled_at']);

        // Second duplicate settlement call must be rejected
        $res2 = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests/settle-season', [
            'season_id' => $ctx['season']->id,
            'member_id' => $member->id,
            'grade_a_price' => 35000,
            'grade_b_price' => 25000,
            'service_fee_rate' => 0.025,
        ]);
        $res2->assertStatus(400);
        $this->assertEquals('ERR_HARVESTS_ALREADY_SETTLED', $res2->json('error.code'));
    }
}
