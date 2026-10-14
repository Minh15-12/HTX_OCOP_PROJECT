<?php

namespace Tests\Feature\Agriculture;

use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\LotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Finance\Infrastructure\Persistence\Models\DebtSettlementModel;
use Modules\Finance\Infrastructure\Persistence\Models\ReceivablePayableModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

/**
 * Comprehensive 4-Tier E2E Test Suite for Agriculture:
 * Tier 1: Feature Coverage (TT02 10 fields, PHI quarantine, hard blocker, GS1 lot, 3-tier KCS, Traceability)
 * Tier 2: Boundary & Corner Cases (exact safe date, 0 PHI, missing GPS, lot collision, cumulative spray PHI)
 * Tier 3: Cross-Feature Combinations (supply -> quarantine -> harvest -> KCS -> finance settlement debt offset)
 * Tier 4: Real-World Enterprise Scenario (HTX Tan Tien Sweet Palermo Red Dalat complete cycle)
 */
class AgricultureE2ETest extends TestCase
{
    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private function createCooperative(string $code = null, string $name = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'HTX_E2E_' . strtoupper(Str::random(4)),
            'legal_name' => $name ?: 'HTX Nông Nghiệp Tân Tiến E2E',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop, array $permissionCodes = []): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_AGRI_E2E_' . strtoupper(Str::random(4)),
            'name' => 'Agri E2E Test Role',
        ]);

        $defaultPerms = [
            'AGRICULTURE.CREATE', 'AGRICULTURE.READ', 'AGRICULTURE.UPDATE',
            'FINANCE.CREATE', 'FINANCE.READ',
            'PRODUCT.CREATE', 'PRODUCT.READ', 'PRODUCT.UPDATE',
            'INVENTORY.CREATE', 'INVENTORY.READ',
        ];
        $allPerms = array_unique(array_merge($defaultPerms, $permissionCodes));

        foreach ($allPerms as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm ' . $pCode, 'module' => 'Agriculture']
            );
            $role->permissions()->attach($permission->id);
        }

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'agri_user_' . Str::random(6),
            'email' => 'agri_user_' . Str::random(6) . '@tantien.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Kỹ Sư Nông Nghiệp Tân Tiến',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    private function createProductionContext(CooperativeModel $coop, array $overrides = []): array
    {
        $unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'unit_code' => $overrides['unit_code'] ?? 'PUC-49-015-' . strtoupper(Str::random(4)),
            'name' => $overrides['unit_name'] ?? 'Vùng Trồng Công Nghệ Cao Hòn Bồ',
            'crop' => $overrides['crop'] ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'area' => $overrides['unit_area'] ?? 40.0,
            'status' => 'ACTIVE',
            'location' => [
                'province' => 'Lâm Đồng',
                'district' => 'Đà Lạt',
                'commune' => 'Phường 12',
                'coordinates' => '11.9404, 108.4583',
            ],
            'registration_information' => [
                'vietgap' => [
                    'cert_number' => 'VIETGAP-DALAT-2025-089',
                    'valid_until' => '2027-12-31',
                ],
            ],
        ]);

        $plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => $overrides['plot_code'] ?? 'PLOT-TT-01-' . strtoupper(Str::random(3)),
            'area' => $overrides['plot_area'] ?? 2500.0,
            'status' => 'ACTIVE',
            'land_relation' => [
                'gps_coordinates' => '11.9404, 108.4583',
                'address' => 'Tổ Hòn Bồ, P12, Đà Lạt',
            ],
        ]);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => $overrides['season_name'] ?? 'Vụ Thu Đông 2026 - Ớt chuông Sweet Palermo Đỏ',
            'crop' => $overrides['crop'] ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'start_date' => $overrides['start_date'] ?? '2026-08-01',
            'expected_end_date' => $overrides['expected_end_date'] ?? '2026-12-31',
            'status' => 'ACTIVE',
        ]);

        return compact('unit', 'plot', 'season');
    }

    private function createMaterial(CooperativeModel $coop, array $overrides = []): MaterialModel
    {
        return MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => $overrides['sku'] ?? 'MAT-BIO-' . strtoupper(Str::random(5)),
            'name' => $overrides['name'] ?? 'Chế Phẩm Sinh Học Neem Oil',
            'category' => $overrides['category'] ?? 'PESTICIDE',
            'unit' => $overrides['unit'] ?? 'LIT',
            'status' => 'ACTIVE',
            'safety_information' => [
                'phi_days' => $overrides['phi_days'] ?? 3,
                'active_ingredient' => 'Azadirachtin',
            ],
        ]);
    }

    // =========================================================================
    // TIER 1: FEATURE COVERAGE & API CONTRACTS
    // =========================================================================

    /**
     * Tier 1: TT02/2024 10-Field Farming Log
     * Ensures all 10 standard fields are properly accepted, persisted, and returned.
     */
    public function test_tier1_tt02_ten_fields_recorded_and_returned_in_farming_log(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);
        $mat = $this->createMaterial($coop, ['name' => 'Chế phẩm sinh học Neem Bio', 'phi_days' => 7]);

        $payload = [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-10-10',
            'description' => 'Phun phòng trừ bọ trĩ định kỳ theo quy trình VietGAP',
            'material_id' => $mat->id,
            'material_batch_number' => 'BATCH-NEEM-2026-01',
            'quantity_applied' => 12.5,
            'unit' => 'LIT',
            'phi_days' => 7,
            'gps_latitude' => 11.940412,
            'gps_longitude' => 108.458319,
            'attachment_reference' => ['https://cdn.htxtantien.vn/photos/spraying_plot01.jpg'],
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.activity_type', 'SPRAYING');
        $response->assertJsonPath('data.activity_date', '2026-10-10');
        $response->assertJsonPath('data.plot_id', $ctx['plot']->id);
        $response->assertJsonPath('data.crop_season_id', $ctx['season']->id);
        $response->assertJsonPath('data.material_id', $mat->id);
        $response->assertJsonPath('data.material_batch_number', 'BATCH-NEEM-2026-01');
        $response->assertJsonPath('data.quantity_applied', 12.5);
        $response->assertJsonPath('data.unit', 'LIT');
        $response->assertJsonPath('data.phi_days', 7);
        $response->assertJsonPath('data.gps_latitude', 11.940412);
        $response->assertJsonPath('data.gps_longitude', 108.458319);

        $this->assertDatabaseHas('farming_logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'material_batch_number' => 'BATCH-NEEM-2026-01',
            'quantity_applied' => 12.5,
            'phi_days' => 7,
        ]);
    }

    /**
     * Tier 1: PHI Guard Quarantine Logic
     * Spraying with phi_days > 0 automatically calculates safe_harvest_date and puts plot into IN_QUARANTINE.
     */
    public function test_tier1_spraying_with_phi_locks_farm_plot_to_quarantine(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);
        $mat = $this->createMaterial($coop);

        $payload = [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-10-10',
            'material_id' => $mat->id,
            'phi_days' => 5,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', $payload);
        $response->assertStatus(201);

        // Safe harvest date: 2026-10-10 + 5 days = 2026-10-15
        $this->assertDatabaseHas('phi_calculations', [
            'configured_phi_days' => 5,
            'safety_date' => '2026-10-15',
            'status' => 'ACTIVE',
        ]);

        $this->assertDatabaseHas('farm_plots', [
            'id' => $ctx['plot']->id,
            'status' => 'IN_QUARANTINE',
            'quarantine_until' => '2026-10-15',
        ]);

        $freshPlot = $ctx['plot']->fresh();
        $this->assertTrue($freshPlot->isInQuarantine('2026-10-12'));
    }

    /**
     * Tier 1: Harvest Hard Blocker (ERR_HARVEST_PHI_VIOLATION)
     * Harvesting before safe_harvest_date is strictly blocked with HTTP 400 and audit logged.
     */
    public function test_tier1_harvest_before_safe_date_is_hard_blocked_with_error_code(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);
        $mat = $this->createMaterial($coop);

        // Log spraying on 2026-10-10 with PHI 7 days (Safe date = 2026-10-17)
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-10-10',
            'material_id' => $mat->id,
            'phi_days' => 7,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        // Attempt premature harvest on 2026-10-14 (Violates PHI!)
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-14',
            'quantity' => 1000.0,
            'unit' => 'KG',
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('error.code', 'ERR_HARVEST_PHI_VIOLATION');

        $this->assertDatabaseHas('audit_events', [
            'action' => 'PHI_VIOLATION_ATTEMPTED',
            'cooperative_id' => $coop->id,
        ]);

        $this->assertDatabaseMissing('harvests', [
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-14',
        ]);
    }

    /**
     * Tier 1: GS1 Standard Lot Code Generation
     * Ensures lot codes match the standard pattern LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq].
     */
    public function test_tier1_gs1_lot_code_generation_conforms_to_standard(): void
    {
        $coop = $this->createCooperative('TT', 'HTX Tân Tiến');
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop, ['plot_code' => 'PLOT-01']);

        // Create harvest on valid date
        $harvestRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-25',
            'quantity' => 1500.0,
            'unit' => 'KG',
        ]);
        $harvestRes->assertStatus(201);
        $harvestId = $harvestRes->json('data.id');

        // Create Lot
        $lotRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/lots', [
            'harvest_id' => $harvestId,
            'quantity' => 1500.0,
            'unit' => 'KG',
        ]);

        $lotRes->assertStatus(201);
        $lotCode = $lotRes->json('data.lot_code');

        $this->assertNotNull($lotCode);
        $this->assertMatchesRegularExpression('/^LOT-[A-Z0-9_-]+-[A-Z0-9_-]+-\d{8}-\w+$/', $lotCode);
        $this->assertDatabaseHas('lots', [
            'harvest_id' => $harvestId,
            'lot_code' => $lotCode,
        ]);
    }

    /**
     * Tier 1: 3-Tier KCS Inspection Data Contracts
     * Verifies Gate Check, Quick Lab, and Grading classification fields on harvest records.
     */
    public function test_tier1_three_tier_kcs_quality_inspection_records_and_classification(): void
    {
        $coop = $this->createCooperative();
        $ctx = $this->createProductionContext($coop);

        // Grade A harvest meeting both uniformity >= 90% and Brix >= 7.0
        $harvestA = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-20',
            'quantity' => 1200.0,
            'unit' => 'KG',
            'kcs_status' => 'GRADED',
            'kcs_gate_check' => [
                'passed' => true,
                'inspector' => 'Nguyen Gate KCS',
                'phi_safety_verified' => true,
                'checked_at' => '2026-10-20 06:30:00',
            ],
            'kcs_quick_lab' => [
                'lab_status' => 'LAB_PASSED',
                'kit_used' => 'RapidTest-Agri 2026',
                'residue_ppm' => 0.0,
                'tested_at' => '2026-10-20 07:15:00',
            ],
            'grade' => 'GRADE_A',
            'brix_level' => 8.2,
            'uniformity_rate' => 93.5,
        ]);

        $this->assertEquals('GRADED', $harvestA->kcs_status);
        $this->assertEquals('GRADE_A', $harvestA->grade);
        $this->assertEquals(8.2, (float) $harvestA->brix_level);
        $this->assertEquals(93.5, (float) $harvestA->uniformity_rate);
        $this->assertTrue($harvestA->kcs_gate_check['passed']);
        $this->assertEquals('LAB_PASSED', $harvestA->kcs_quick_lab['lab_status']);

        // Grade B harvest: Lab passed, but Brix < 7.0 or uniformity < 90%
        $harvestB = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-21',
            'quantity' => 800.0,
            'unit' => 'KG',
            'kcs_status' => 'GRADED',
            'kcs_gate_check' => ['passed' => true],
            'kcs_quick_lab' => ['lab_status' => 'LAB_PASSED'],
            'grade' => 'GRADE_B',
            'brix_level' => 6.2,
            'uniformity_rate' => 82.0,
        ]);

        $this->assertEquals('GRADE_B', $harvestB->grade);
        $this->assertLessThan(7.0, (float) $harvestB->brix_level);
    }

    /**
     * Tier 1: Traceability Provenance Tree
     * Verifies the complete lineage: cooperative, PUC, plot, season, TT02 logs, harvest, lot.
     */
    public function test_tier1_traceability_dossier_contains_complete_provenance_tree(): void
    {
        $coop = $this->createCooperative('HTX_TRACE', 'HTX Nông Nghiệp Truy Xuất');
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop, ['plot_code' => 'PLOT-PALERMO-01']);
        $mat = $this->createMaterial($coop);

        // 1. Create Farming Log
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'FERTILIZING',
            'activity_date' => '2026-09-01',
            'material_id' => $mat->id,
            'material_batch_number' => 'BATCH-ORG-01',
            'quantity_applied' => 50.0,
            'unit' => 'KG',
            'description' => 'Bón lót phân trùn quế',
        ]);

        // 2. Create Harvest
        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-15',
            'quantity' => 2000.0,
            'unit' => 'KG',
            'kcs_status' => 'GRADED',
            'grade' => 'GRADE_A',
            'brix_level' => 7.8,
            'uniformity_rate' => 92.0,
        ]);

        // 3. Create Lot
        $lotRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/lots', [
            'harvest_id' => $harvest->id,
            'quantity' => 2000.0,
            'unit' => 'KG',
        ]);
        $lotId = $lotRes->json('data.id');

        // 4. Traceability API Query
        $traceRes = $this->actingAs($user, 'sanctum')->getJson("/api/v1/lots/{$lotId}/traceability");

        $traceRes->assertStatus(200);
        $traceRes->assertJsonPath('data.lot.id', $lotId);
        $traceRes->assertJsonPath('data.harvest.grade', 'GRADE_A');
        $traceRes->assertJsonPath('data.cooperative.cooperative_code', 'HTX_TRACE');
        $traceRes->assertJsonPath('data.farm_plot.plot_code', 'PLOT-PALERMO-01');
        $traceRes->assertJsonPath('data.production_unit.id', $ctx['unit']->id);
        $this->assertNotEmpty($traceRes->json('data.tt02_traceability_logs'));
    }

    // =========================================================================
    // TIER 2: BOUNDARY, CORNER CASES & ADVERSARIAL VERIFICATION
    // =========================================================================

    /**
     * Tier 2 Boundary: Harvest on EXACT safe_harvest_date is permitted.
     * When harvest_date == safe_harvest_date, the isolation window has elapsed, so harvest is allowed.
     */
    public function test_tier2_harvest_on_exact_safe_harvest_date_is_allowed(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);
        $mat = $this->createMaterial($coop);

        // Spray on 2026-10-01 with 10 days PHI -> Safe date = 2026-10-11
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-10-01',
            'material_id' => $mat->id,
            'phi_days' => 10,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        // Harvest on EXACTLY 2026-10-11
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-11',
            'quantity' => 1200.0,
            'unit' => 'KG',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('harvests', [
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-11',
        ]);
    }

    /**
     * Tier 2 Edge Case: Spraying with 0 PHI days does not lock plot into quarantine.
     */
    public function test_tier2_spraying_with_zero_phi_days_does_not_quarantine_plot(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);
        $mat = $this->createMaterial($coop, ['phi_days' => 0]);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-10-01',
            'material_id' => $mat->id,
            'phi_days' => 0,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        $freshPlot = $ctx['plot']->fresh();
        $this->assertEquals('ACTIVE', $freshPlot->status);
        $this->assertNull($freshPlot->quarantine_until);

        // Immediate next-day harvest is permitted
        $harvestRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-02',
            'quantity' => 500.0,
            'unit' => 'KG',
        ]);
        $harvestRes->assertStatus(201);
    }

    /**
     * Tier 2 Adversarial: Spraying log without GPS coordinates is rejected with HTTP 422.
     * Enforces BR-FARM-003 rule.
     */
    public function test_tier2_spraying_without_gps_coordinates_is_rejected_with_422(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);
        $mat = $this->createMaterial($coop);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-10-01',
            'material_id' => $mat->id,
            'phi_days' => 5,
            // GPS coordinates omitted!
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'ERR_GPS_LOCATION_REQUIRED');
    }

    /**
     * Tier 2 Collision: Duplicate GS1 lot codes automatically resolve collisions.
     */
    public function test_tier2_duplicate_gs1_lot_code_automatically_resolves_collision(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-15',
            'quantity' => 3000.0,
            'unit' => 'KG',
        ]);

        // First Lot
        $lot1Res = $this->actingAs($user, 'sanctum')->postJson('/api/v1/lots', [
            'harvest_id' => $harvest->id,
            'quantity' => 1500.0,
            'unit' => 'KG',
        ]);
        $lot1Res->assertStatus(201);
        $code1 = $lot1Res->json('data.lot_code');

        // Second Lot on same day
        $lot2Res = $this->actingAs($user, 'sanctum')->postJson('/api/v1/lots', [
            'harvest_id' => $harvest->id,
            'quantity' => 1500.0,
            'unit' => 'KG',
        ]);
        $lot2Res->assertStatus(201);
        $code2 = $lot2Res->json('data.lot_code');

        $this->assertNotEquals($code1, $code2);
        $this->assertEquals(2, LotModel::whereIn('lot_code', [$code1, $code2])->count());
    }

    /**
     * Tier 2 Boundary: Harvest with zero or negative quantity is rejected with 422.
     */
    public function test_tier2_harvest_with_zero_or_negative_quantity_is_rejected(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);

        $resZero = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-15',
            'quantity' => 0,
            'unit' => 'KG',
        ]);
        $resZero->assertStatus(422);

        $resNeg = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-15',
            'quantity' => -50.0,
            'unit' => 'KG',
        ]);
        $resNeg->assertStatus(422);
    }

    /**
     * Tier 2 Boundary: Cumulative multiple sprayings enforce the latest safe harvest date.
     */
    public function test_tier2_cumulative_multiple_sprays_enforces_latest_safe_date(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);
        $mat1 = $this->createMaterial($coop, ['name' => 'Thuốc trừ sâu sinh học 1']);
        $mat2 = $this->createMaterial($coop, ['name' => 'Thuốc trừ nấm sinh học 2']);

        // Spray 1: 2026-10-01 + 5 days PHI -> Safe date = 2026-10-06
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-10-01',
            'material_id' => $mat1->id,
            'phi_days' => 5,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        // Spray 2: 2026-10-04 + 10 days PHI -> Safe date = 2026-10-14 (Latest!)
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-10-04',
            'material_id' => $mat2->id,
            'phi_days' => 10,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        // Harvest on 2026-10-08 (after Spray 1, but before Spray 2!) -> BLOCKED!
        $midRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-08',
            'quantity' => 1000.0,
            'unit' => 'KG',
        ]);
        $midRes->assertStatus(400);
        $midRes->assertJsonPath('error.code', 'ERR_HARVEST_PHI_VIOLATION');

        // Harvest on 2026-10-15 (after latest Spray 2 safe date) -> ALLOWED!
        $safeRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-15',
            'quantity' => 1000.0,
            'unit' => 'KG',
        ]);
        $safeRes->assertStatus(201);
    }

    /**
     * Tier 2 Edge Case: Quick Lab rejection marks harvest as REJECT grade.
     */
    public function test_tier2_quick_lab_rejection_marks_harvest_as_rejected(): void
    {
        $coop = $this->createCooperative();
        $ctx = $this->createProductionContext($coop);

        $rejectedHarvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-20',
            'quantity' => 500.0,
            'unit' => 'KG',
            'kcs_status' => 'LAB_REJECTED',
            'kcs_quick_lab' => [
                'lab_status' => 'LAB_REJECTED',
                'active_substance_detected' => 'Chlorpyrifos',
                'ppm' => 0.08,
            ],
            'grade' => 'REJECT',
        ]);

        $this->assertEquals('LAB_REJECTED', $rejectedHarvest->kcs_status);
        $this->assertEquals('REJECT', $rejectedHarvest->grade);
        $this->assertDatabaseHas('harvests', [
            'id' => $rejectedHarvest->id,
            'grade' => 'REJECT',
            'kcs_status' => 'LAB_REJECTED',
        ]);
    }

    // =========================================================================
    // TIER 3: CROSS-FEATURE COMBINATIONS & INTEGRATED WORKFLOWS
    // =========================================================================

    /**
     * Tier 3 Integration: End-to-End Cycle from Farming -> Quarantine -> Safe Harvest -> KCS -> Debt Offset
     * Verifies the business workflow between Agriculture, Inventory credit debt, and Finance settlement.
     */
    public function test_tier3_end_to_end_supply_quarantine_harvest_kcs_and_debt_offset(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);
        $ctx = $this->createProductionContext($coop);
        $mat = $this->createMaterial($coop, ['name' => 'Chế phẩm sinh học Neem Bio', 'phi_days' => 7]);

        // Step 1: Create Member with warehouse credit debt of 10,000,000 VND
        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'TV-001',
            'identity_information' => ['full_name' => 'Nguyễn Văn Tân', 'phone' => '0912345678'],
            'member_type' => 'REGULAR',
            'credit_limit' => 50000000.0,
            'status' => 'ACTIVE',
        ]);

        $debt = ReceivablePayableModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'debt_code' => 'CN-VT-2026-001',
            'debt_type' => 'RECEIVABLE',
            'counterparty_type' => 'MEMBER',
            'counterparty_id' => $member->id,
            'counterparty_name' => 'Nguyễn Văn Tân',
            'original_amount' => 10000000.0,
            'outstanding_amount' => 10000000.0,
            'due_date' => '2026-12-31',
            'status' => 'OPEN',
            'description' => 'Xuất nợ phân bón vi sinh đầu vụ',
        ]);

        // Step 2: Member logs spraying activity with 7 days PHI
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-10-01',
            'material_id' => $mat->id,
            'phi_days' => 7,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ]);

        // Step 3: Premature harvest blocked on 2026-10-04
        $prematureRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-04',
            'quantity' => 1000.0,
            'unit' => 'KG',
        ]);
        $prematureRes->assertStatus(400);
        $prematureRes->assertJsonPath('error.code', 'ERR_HARVEST_PHI_VIOLATION');

        // Step 4: Safe harvest permitted after PHI expires on 2026-10-10
        $harvestRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-10-10',
            'quantity' => 1500.0,
            'unit' => 'KG',
        ]);
        $harvestRes->assertStatus(201);
        $harvestId = $harvestRes->json('data.id');

        // Step 5: KCS Grading inspection marks Grade A
        $harvestModel = HarvestModel::find($harvestId);
        $harvestModel->update([
            'kcs_status' => 'GRADED',
            'kcs_gate_check' => ['passed' => true, 'phi_verified' => true],
            'kcs_quick_lab' => ['lab_status' => 'LAB_PASSED', 'residue_ppm' => 0.0],
            'grade' => 'GRADE_A',
            'brix_level' => 8.4,
            'uniformity_rate' => 93.0,
        ]);

        // Step 6: Create GS1 Lot
        $lotRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/lots', [
            'harvest_id' => $harvestId,
            'quantity' => 1500.0,
            'unit' => 'KG',
        ]);
        $lotRes->assertStatus(201);

        // Step 7: Settle season harvest and offset warehouse debt:
        // Produce value: 30,000,000 VND
        // Service fee 2.5%: 750,000 VND
        // Net after fee: 29,250,000 VND
        // Debt offset: 10,000,000 VND -> debt cleared to 0
        // Net payout to member: 19,250,000 VND
        $settleRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/receivable-payables/harvest-settlements', [
            'member_id' => $member->id,
            'produce_value' => 30000000.0,
            'service_fee_rate' => 0.025,
        ]);

        $settleRes->assertStatus(200);
        $settleRes->assertJsonPath('data.total_debt_offset', 10000000);
        $settleRes->assertJsonPath('data.net_payout', 19250000);

        // Verify debt is settled and payment voucher is generated
        $freshDebt = $debt->fresh();
        $this->assertEquals(0.0, (float) $freshDebt->outstanding_amount);
        $this->assertEquals('SETTLED', $freshDebt->status);

        $this->assertDatabaseHas('debt_settlements', [
            'debt_id' => $debt->id,
            'payment_method' => 'HARVEST_OFFSET',
            'amount' => 10000000,
        ]);

        $this->assertDatabaseHas('cash_transactions', [
            'member_id' => $member->id,
            'transaction_type' => 'EXPENSE',
            'amount' => 19250000.0,
            'category' => 'QUYET_TOAN_MUA_VU',
        ]);
    }

    /**
     * Tier 3 Integration: Debt offset when debt exceeds total produce value.
     * Partial offset is applied, remaining debt carries forward, and net payout is 0.
     */
    public function test_tier3_debt_offset_when_debt_exceeds_produce_value(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'TV-002',
            'identity_information' => ['full_name' => 'Trần Thị Bích'],
            'member_type' => 'REGULAR',
            'credit_limit' => 60000000.0,
            'status' => 'ACTIVE',
        ]);

        // Member has 40,000,000 VND in debt
        $debt = ReceivablePayableModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'debt_code' => 'CN-VT-2026-002',
            'debt_type' => 'RECEIVABLE',
            'counterparty_type' => 'MEMBER',
            'counterparty_id' => $member->id,
            'counterparty_name' => 'Trần Thị Bích',
            'original_amount' => 40000000.0,
            'outstanding_amount' => 40000000.0,
            'due_date' => '2026-12-31',
            'status' => 'OPEN',
        ]);

        // Produce value: 15,000,000 VND; Fee 2%: 300,000 VND; Net before debt: 14,700,000 VND
        // Debt offset: min(40,000,000, 14,700,000) = 14,700,000 VND
        // Net payout: 0 VND
        // Remaining debt: 25,300,000 VND (PARTIALLY_SETTLED)
        $settleRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/receivable-payables/harvest-settlements', [
            'member_id' => $member->id,
            'produce_value' => 15000000.0,
            'service_fee_rate' => 0.02,
        ]);

        $settleRes->assertStatus(200);
        $settleRes->assertJsonPath('data.total_debt_offset', 14700000);
        $settleRes->assertJsonPath('data.net_payout', 0);

        $freshDebt = $debt->fresh();
        $this->assertEquals(25300000.0, (float) $freshDebt->outstanding_amount);
        $this->assertEquals('PARTIALLY_SETTLED', $freshDebt->status);

        // No cash payout transaction created because net payout is 0
        $this->assertDatabaseMissing('cash_transactions', [
            'member_id' => $member->id,
            'amount' => 0.0,
        ]);
    }

    // =========================================================================
    // TIER 4: REAL-WORLD SCENARIO: HTX TÂN TIẾN SWEET PALERMO RED DALAT
    // =========================================================================

    /**
     * Tier 4: Enterprise Simulation for HTX Nông Nghiệp Tân Tiến
     * Validates the 5-stage farming journey, 3-tier KCS, GS1 QR traceability, and product master data attachment.
     */
    public function test_tier4_htx_tan_tien_sweet_palermo_red_complete_farming_cycle(): void
    {
        // 1. Cooperative: HTX Tân Tiến Đà Lạt
        $coop = $this->createCooperative('HTX-TT-DALAT', 'Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến');
        $user = $this->createUserWithPermissions($coop);

        // 2. Production Unit: Hòn Bồ PUC
        $ctx = $this->createProductionContext($coop, [
            'unit_code' => 'PUC-49-015-9923',
            'unit_name' => 'Vùng Sản Xuất Nông Nghiệp Công Nghệ Cao Hòn Bồ',
            'plot_code' => 'PLOT-TT-NV01-01',
            'season_name' => 'Vụ Thu Đông 2026 - Ớt chuông Sweet Palermo Đỏ',
            'crop' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
        ]);

        // 3. Product Master Data
        $prodRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/products', [
            'product_code' => 'SP-PALERMO-RED-01',
            'product_name' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'category' => 'FOOD',
            'brand' => 'Rau Đà Lạt',
            'specification' => [
                'brix' => 8.5,
                'fruit_weight' => '100 - 150g',
                'color' => 'Đỏ tươi tự nhiên',
            ],
            'quality_information' => [
                'vietgap' => [
                    'cert_number' => 'VIETGAP-DALAT-2025-089',
                    'valid_until' => '2027-12-31',
                ],
            ],
        ]);
        $prodRes->assertStatus(201);
        $productId = $prodRes->json('data.id');

        // 4. Record 5-Stage Farming Journey (TT02/2024 compliance)
        // Stage 1: Plowing & Cocopeat bed prep
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'PLOWING',
            'activity_date' => '2026-08-01',
            'description' => 'Làm đất và xử lý giá thể xơ dừa với nấm đối kháng Trichoderma',
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
        ])->assertStatus(201);

        // Stage 2: Basal fertilizing with organic vermicompost
        $fertMat = $this->createMaterial($coop, [
            'sku' => 'MAT-FERT-ORG',
            'name' => 'Phân Trùn Quế Hữu Cơ Vi Sinh',
            'category' => 'FERTILIZER',
            'unit' => 'KG',
            'phi_days' => 0,
        ]);
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'FERTILIZING',
            'activity_date' => '2026-08-05',
            'material_id' => $fertMat->id,
            'material_batch_number' => 'BATCH-TRUNQUE-01',
            'quantity_applied' => 500.0,
            'unit' => 'KG',
            'description' => 'Bón lót phân trùn quế bổ sung dinh dưỡng hữu cơ',
        ])->assertStatus(201);

        // Stage 3: Automated Israeli drip irrigation
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'IRRIGATION',
            'activity_date' => '2026-08-15',
            'description' => 'Tưới nhỏ giọt bổ sung khoáng chất vi lượng công nghệ Israel',
        ])->assertStatus(201);

        // Stage 4: Biological pest prevention with 3-day PHI
        $sprayMat = $this->createMaterial($coop, [
            'sku' => 'MAT-NEEM-OIL',
            'name' => 'Chế phẩm sinh học Neem Oil',
            'category' => 'PESTICIDE',
            'unit' => 'LIT',
            'phi_days' => 3,
        ]);
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-08-25',
            'material_id' => $sprayMat->id,
            'material_batch_number' => 'BATCH-NEEM-AUG',
            'quantity_applied' => 5.0,
            'unit' => 'LIT',
            'phi_days' => 3,
            'gps_latitude' => 11.9404,
            'gps_longitude' => 108.4583,
            'description' => 'Phun phòng trừ bọ trĩ sinh học, cách ly an toàn 3 ngày',
        ])->assertStatus(201);

        // Stage 5: Selective harvesting on safe date 2026-08-30 (Safe date was 2026-08-28)
        $harvestRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-08-30',
            'quantity' => 2500.0,
            'unit' => 'KG',
        ]);
        $harvestRes->assertStatus(201);
        $harvestId = $harvestRes->json('data.id');

        // 5. Apply 3-Tier KCS Inspection
        $harvest = HarvestModel::find($harvestId);
        $harvest->update([
            'kcs_status' => 'GRADED',
            'kcs_gate_check' => [
                'passed' => true,
                'gate_station' => 'Trạm kiểm soát nông trường Hòn Bồ',
                'phi_safety_verified' => true,
                'inspected_at' => '2026-08-30 06:00:00',
            ],
            'kcs_quick_lab' => [
                'lab_status' => 'LAB_PASSED',
                'kit' => 'TestKit-Residue-01',
                'residue_ppm' => 0.0,
                'tested_at' => '2026-08-30 06:45:00',
            ],
            'grade' => 'GRADE_A',
            'brix_level' => 8.5,
            'uniformity_rate' => 94.0,
        ]);

        // 6. GS1 Lot Identification
        $lotRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/lots', [
            'harvest_id' => $harvestId,
            'quantity' => 2500.0,
            'unit' => 'KG',
        ]);
        $lotRes->assertStatus(201);
        $lotId = $lotRes->json('data.id');
        $lotCode = $lotRes->json('data.lot_code');

        // 7. Attach Lot to Product Master Data
        $attachRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/products/{$productId}/lots", [
            'lot_id' => $lotId,
            'quantity' => 2500.0,
        ]);
        $attachRes->assertStatus(201);

        // 8. Verify End-to-End Traceability Dossier
        $traceRes = $this->actingAs($user, 'sanctum')->getJson("/api/v1/lots/{$lotId}/traceability");

        $traceRes->assertStatus(200);
        $traceRes->assertJsonPath('data.lot.lot_code', $lotCode);
        $traceRes->assertJsonPath('data.cooperative.legal_name', 'Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến');
        $traceRes->assertJsonPath('data.production_unit.unit_code', 'PUC-49-015-9923');
        $traceRes->assertJsonPath('data.farm_plot.plot_code', 'PLOT-TT-NV01-01');
        $traceRes->assertJsonPath('data.harvest.grade', 'GRADE_A');
        $traceRes->assertJsonPath('data.harvest.brix_level', 8.5);
        $traceRes->assertJsonPath('data.harvest.uniformity_rate', 94);

        // Verify that all 4 previous journey logs are present in chronological trace logs
        $logs = $traceRes->json('data.tt02_traceability_logs');
        $this->assertGreaterThanOrEqual(4, count($logs));
        $activityTypes = collect($logs)->pluck('activity_type')->all();
        $this->assertContains('PLOWING', $activityTypes);
        $this->assertContains('FERTILIZING', $activityTypes);
        $this->assertContains('IRRIGATION', $activityTypes);
        $this->assertContains('SPRAYING', $activityTypes);
    }
}
