<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\MaterialUsageModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Tests\TestCase;

class CropSeasonAndFarmingLogTest extends TestCase
{
    private function createCooperative(string $code = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'HTX_SEASON_' . Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp Mùa Vụ',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop, array $permissionCodes): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_SEASON_TEST_' . Str::random(4),
            'name' => 'Season Test Role',
        ]);

        foreach ($permissionCodes as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm ' . $pCode, 'module' => 'Agriculture']
            );
            $role->permissions()->attach($permission->id);
        }

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'season_user_' . Str::random(5),
            'email' => 'season_user_' . Str::random(5) . '@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Quản Lý Mùa Vụ',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    private function createProductionUnit(CooperativeModel $coop): ProductionUnitModel
    {
        return ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'unit_code' => 'PUC_' . Str::random(5),
            'name' => 'Vùng Sản Xuất Thử Nghiệm',
            'crop' => 'Lúa Tám Mới',
            'area' => 10.0,
            'status' => 'ACTIVE',
        ]);
    }

    private function createFarmPlot(ProductionUnitModel $unit): FarmPlotModel
    {
        return FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => 'PLOT_' . Str::random(5),
            'area' => 2.0,
            'status' => 'ACTIVE',
        ]);
    }

    // --- CROP SEASON TESTS ---

    public function test_create_crop_season_successfully(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE', 'AGRICULTURE.READ']);
        $unit = $this->createProductionUnit($coop);

        $payload = [
            'production_unit_id' => $unit->id,
            'name' => 'Mùa Vụ Xuân Hè 2026',
            'crop' => 'Lúa Tám Mới',
            'start_date' => '2026-02-01',
            'expected_end_date' => '2026-06-30',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/crop-seasons', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Mùa Vụ Xuân Hè 2026');
        $response->assertJsonPath('data.status', 'PLANNED');

        $this->assertDatabaseHas('crop_seasons', [
            'production_unit_id' => $unit->id,
            'name' => 'Mùa Vụ Xuân Hè 2026',
            'status' => 'PLANNED',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'CROP_SEASON_CREATED',
            'cooperative_id' => $coop->id,
        ]);
    }

    public function test_close_crop_season_action_endpoint(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.UPDATE', 'AGRICULTURE.READ']);
        $unit = $this->createProductionUnit($coop);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Mùa Vụ Đông Xuân 2025',
            'crop' => 'Lúa',
            'start_date' => '2025-11-01',
            'expected_end_date' => '2026-03-01',
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/crop-seasons/{$season->id}/close", [
                'actual_end_date' => '2026-02-28',
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'COMPLETED');
        $response->assertJsonPath('data.actual_end_date', '2026-02-28');

        $this->assertDatabaseHas('audit_events', [
            'action' => 'CROP_SEASON_CLOSED',
            'cooperative_id' => $coop->id,
        ]);
    }

    // --- FARMING LOG TESTS ---

    public function test_create_farming_log_successfully(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE', 'AGRICULTURE.READ']);
        $unit = $this->createProductionUnit($coop);
        $plot = $this->createFarmPlot($unit);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Mùa Vụ Vải 2026',
            'crop' => 'Vải Thiều',
            'start_date' => '2026-01-01',
            'expected_end_date' => '2026-07-01',
            'status' => 'ACTIVE',
        ]);

        $payload = [
            'crop_season_id' => $season->id,
            'plot_id' => $plot->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-02-15',
            'description' => 'Phun thuốc phòng trừ sâu róm đợt 1',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.activity_type', 'SPRAYING');

        $this->assertDatabaseHas('farming_logs', [
            'crop_season_id' => $season->id,
            'plot_id' => $plot->id,
            'activity_type' => 'SPRAYING',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'FARMING_LOG_CREATED',
            'cooperative_id' => $coop->id,
        ]);
    }

    public function test_cannot_add_farming_log_to_closed_season(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE']);
        $unit = $this->createProductionUnit($coop);
        $plot = $this->createFarmPlot($unit);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Mùa Vụ Đã Đóng',
            'crop' => 'Ngô',
            'start_date' => '2025-01-01',
            'expected_end_date' => '2025-05-01',
            'actual_end_date' => '2025-05-01',
            'status' => 'COMPLETED',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/farming-logs', [
            'crop_season_id' => $season->id,
            'plot_id' => $plot->id,
            'activity_type' => 'WEEDING',
            'activity_date' => '2025-04-01',
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('error.code', 'SEASON_CLOSED');
    }

    // --- MATERIAL USAGE TESTS ---

    public function test_create_material_usage_for_farming_log(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE', 'AGRICULTURE.READ']);
        $unit = $this->createProductionUnit($coop);
        $plot = $this->createFarmPlot($unit);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Mùa Vụ Cam 2026',
            'crop' => 'Cam',
            'start_date' => '2026-01-01',
            'expected_end_date' => '2026-12-01',
            'status' => 'ACTIVE',
        ]);

        $log = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $season->id,
            'plot_id' => $plot->id,
            'activity_type' => 'FERTILIZING',
            'activity_date' => '2026-02-10',
            'description' => 'Bón phân NPK đợt 1',
        ]);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'NPK_16_16_8',
            'name' => 'Phân bón NPK 16-16-8',
            'category' => 'FERTILIZER',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        $payload = [
            'material_id' => $material->id,
            'quantity' => 50.5,
            'unit' => 'KG',
            'batch_reference' => 'BATCH_2026_001',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/farming-logs/{$log->id}/material-usages", $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.quantity', 50.5);

        $this->assertDatabaseHas('material_usages', [
            'farming_log_id' => $log->id,
            'material_id' => $material->id,
            'quantity' => 50.5,
        ]);
    }

    // --- PHI CALCULATION TESTS ---

    public function test_calculate_phi_with_configured_days_computes_safety_date_and_isolated_status(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE', 'AGRICULTURE.READ']);
        $unit = $this->createProductionUnit($coop);
        $plot = $this->createFarmPlot($unit);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Mùa Vụ Rau 2026',
            'crop' => 'Rau Ăn Lá',
            'start_date' => '2026-02-01',
            'expected_end_date' => '2026-04-01',
            'status' => 'ACTIVE',
        ]);

        $log = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $season->id,
            'plot_id' => $plot->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-01', // Future / Recent application date
        ]);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'PEST_001',
            'name' => 'Thuốc Trừ Sâu Sinh Học A',
            'category' => 'PESTICIDE',
            'unit' => 'LIT',
            'safety_information' => ['phi_days' => 14], // 14 days PHI
            'status' => 'ACTIVE',
        ]);

        $appDate = now()->format('Y-m-d');
        $expectedSafetyDate = now()->addDays(14)->format('Y-m-d');

        $payload = [
            'material_id' => $material->id,
            'application_date' => $appDate,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/farming-logs/{$log->id}/phi-calculations", $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.configured_phi_days', 14);
        $response->assertJsonPath('data.safety_date', $expectedSafetyDate);
        $response->assertJsonPath('data.status', 'ISOLATED');

        $this->assertDatabaseHas('phi_calculations', [
            'farming_log_id' => $log->id,
            'material_id' => $material->id,
            'configured_phi_days' => 14,
            'status' => 'ISOLATED',
        ]);
    }

    public function test_calculate_phi_without_configured_days_returns_unknown_status(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE', 'AGRICULTURE.READ']);
        $unit = $this->createProductionUnit($coop);
        $plot = $this->createFarmPlot($unit);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Mùa Vụ Chè 2026',
            'crop' => 'Chè',
            'start_date' => '2026-01-01',
            'expected_end_date' => '2026-12-01',
            'status' => 'ACTIVE',
        ]);

        $log = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $season->id,
            'plot_id' => $plot->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-02-01',
        ]);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'UNKNOWN_MAT',
            'name' => 'Vật tư Không Rõ PHI',
            'category' => 'PESTICIDE',
            'unit' => 'KG',
            'safety_information' => null, // No PHI info
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/farming-logs/{$log->id}/phi-calculations", [
                'material_id' => $material->id,
                'application_date' => '2026-02-01',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.configured_phi_days', null);
        $response->assertJsonPath('data.safety_date', null);
        $response->assertJsonPath('data.status', 'UNKNOWN');
    }

    public function test_cross_tenant_isolation_prevents_viewing_crop_season_of_other_cooperative(): void
    {
        $coopA = $this->createCooperative('HTX_SEAS_A');
        $coopB = $this->createCooperative('HTX_SEAS_B');

        $userA = $this->createUserWithPermissions($coopA, ['AGRICULTURE.READ']);
        $unitB = $this->createProductionUnit($coopB);

        $seasonB = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unitB->id,
            'name' => 'Mùa Vụ HTX B',
            'crop' => 'Ngô',
            'start_date' => '2026-01-01',
            'expected_end_date' => '2026-05-01',
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($userA, 'sanctum')->getJson("/api/v1/crop-seasons/{$seasonB->id}");

        $response->assertStatus(404);
        $response->assertJsonPath('error.code', 'CROP_SEASON_NOT_FOUND');
    }
}
