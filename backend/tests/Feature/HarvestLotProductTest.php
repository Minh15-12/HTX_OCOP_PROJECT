<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\LotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\PhiCalculationModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class HarvestLotProductTest extends TestCase
{
    private function createCooperative(string $code = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'HTX_HARVEST_' . Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp Thu Hoạch & Lô Hàng',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop, array $permissionCodes): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_HARVEST_TEST_' . Str::random(4),
            'name' => 'Harvest Test Role',
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
            'username' => 'harvest_user_' . Str::random(5),
            'email' => 'harvest_user_' . Str::random(5) . '@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Quản Lý Thu Hoạch',
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
            'unit_code' => 'PUC_CONTEXT_' . Str::random(4),
            'name' => 'Vùng Trồng Cây Ăn Quả',
            'crop' => 'Cam Sành',
            'area' => 12.5,
            'status' => 'ACTIVE',
        ]);

        $plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => 'PLOT_CTX_' . Str::random(4),
            'area' => 2.5,
            'status' => 'ACTIVE',
        ]);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Mùa Vụ Cam 2026',
            'crop' => 'Cam Sành',
            'start_date' => '2026-01-01',
            'expected_end_date' => '2026-10-01',
            'status' => 'ACTIVE',
        ]);

        return compact('unit', 'plot', 'season');
    }

    // --- HARVEST TESTS ---

    public function test_create_harvest_successfully_when_no_phi_violation(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE', 'AGRICULTURE.READ']);
        $ctx = $this->createAgricultureContext($coop);

        $payload = [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-01',
            'quantity' => 1500.5,
            'unit' => 'KG',
            'quality_information' => ['grade' => 'LOAI_1'],
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.quantity', 1500.5);
        $response->assertJsonPath('data.unit', 'KG');

        $this->assertDatabaseHas('harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'quantity' => 1500.5,
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'HARVEST_CREATED',
            'cooperative_id' => $coop->id,
        ]);
    }

    public function test_create_harvest_is_blocked_when_phi_safety_date_is_violated(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE']);
        $ctx = $this->createAgricultureContext($coop);

        $log = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'activity_type' => 'SPRAYING',
            'activity_date' => '2026-09-01',
        ]);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'PEST_VIOLATE',
            'name' => 'Thuốc Trừ Sâu Độc Hóa Học',
            'category' => 'PESTICIDE',
            'unit' => 'LIT',
            'status' => 'ACTIVE',
        ]);

        // PHI calculation: Safety date is 2026-09-20 (Isolated until Sept 20)
        PhiCalculationModel::create([
            'id' => (string) Str::uuid(),
            'farming_log_id' => $log->id,
            'material_id' => $material->id,
            'application_date' => '2026-09-01',
            'configured_phi_days' => 19,
            'safety_date' => '2026-09-20',
            'status' => 'ISOLATED',
            'created_at' => now(),
        ]);

        // Attempting harvest on 2026-09-10 (BEFORE safety date 2026-09-20)
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/harvests', [
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-10', // Violated!
            'quantity' => 500,
            'unit' => 'KG',
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('error.code', 'ERR_HARVEST_PHI_VIOLATION');
    }

    // --- LOT & TRACEABILITY TESTS ---

    public function test_create_lot_from_harvest_and_traceability_lookup(): void
    {
        $coop = $this->createCooperative('HTX_LOT_TRACE');
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE', 'AGRICULTURE.READ']);
        $ctx = $this->createAgricultureContext($coop);

        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-01',
            'quantity' => 2000.0,
            'unit' => 'KG',
        ]);

        // Create Lot for this harvest
        $lotResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/lots', [
            'harvest_id' => $harvest->id,
            'quantity' => 2000.0,
            'unit' => 'KG',
        ]);

        $lotResponse->assertStatus(201);
        $lotId = $lotResponse->json('data.id');
        $lotCode = $lotResponse->json('data.lot_code');

        $this->assertNotNull($lotCode);
        $this->assertDatabaseHas('lots', [
            'id' => $lotId,
            'harvest_id' => $harvest->id,
        ]);

        // Query Traceability Tree
        $traceResponse = $this->actingAs($user, 'sanctum')->getJson("/api/v1/lots/{$lotId}/traceability");

        $traceResponse->assertStatus(200);
        $traceResponse->assertJsonPath('data.lot.lot_code', $lotCode);
        $traceResponse->assertJsonPath('data.harvest.id', $harvest->id);
        $traceResponse->assertJsonPath('data.crop_season.id', $ctx['season']->id);
        $traceResponse->assertJsonPath('data.farm_plot.id', $ctx['plot']->id);
        $traceResponse->assertJsonPath('data.production_unit.id', $ctx['unit']->id);
        $traceResponse->assertJsonPath('data.cooperative.cooperative_code', 'HTX_LOT_TRACE');
    }

    // --- PRODUCT MASTER DATA TESTS ---

    public function test_product_master_data_crud_and_lot_attachment(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['PRODUCT.CREATE', 'PRODUCT.READ', 'PRODUCT.UPDATE', 'AGRICULTURE.CREATE', 'AGRICULTURE.READ']);
        $ctx = $this->createAgricultureContext($coop);

        // 1. Create Product
        $prodResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/products', [
            'product_code' => 'PROD_CAM_SANH_01',
            'product_name' => 'Cam Sành Hàm Yên OCOP',
            'category' => 'TRUONG_QUA',
            'brand' => 'Cam Sành OCOP',
        ]);

        $prodResponse->assertStatus(201);
        $productId = $prodResponse->json('data.id');

        // 2. Create Harvest & Lot
        $harvest = HarvestModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $ctx['season']->id,
            'plot_id' => $ctx['plot']->id,
            'harvest_date' => '2026-09-01',
            'quantity' => 1000.0,
            'unit' => 'KG',
        ]);

        $lotModel = LotModel::create([
            'id' => (string) Str::uuid(),
            'lot_code' => 'LOT_TEST_ATTACH_01',
            'harvest_id' => $harvest->id,
            'quantity' => 1000.0,
            'unit' => 'KG',
            'status' => 'CREATED',
        ]);

        // 3. Attach Lot to Product Master Data
        $attachResponse = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/products/{$productId}/lots", [
                'lot_id' => $lotModel->id,
                'quantity' => 1000.0,
            ]);

        $attachResponse->assertStatus(201);

        $this->assertDatabaseHas('product_lots', [
            'product_id' => $productId,
            'lot_id' => $lotModel->id,
        ]);

        // 4. List product trace lots
        $listLotsResponse = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/products/{$productId}/lots");

        $listLotsResponse->assertStatus(200);
        $listLotsResponse->assertJsonPath('data.0.lot_code', 'LOT_TEST_ATTACH_01');
    }
}
