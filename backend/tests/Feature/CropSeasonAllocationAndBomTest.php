<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Tests\TestCase;

class CropSeasonAllocationAndBomTest extends TestCase
{
    private CooperativeModel $coop;
    private UserModel $user;
    private ProductionUnitModel $unit;
    private CropSeasonModel $season;
    private FarmPlotModel $plot;
    private MemberModel $member;
    private MaterialModel $material;

    protected function setUp(): void
    {
        parent::setUp();

        $this->coop = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_SEASON_' . Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp Thử Nghiệm Mùa Vụ',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_SEASON_' . Str::random(4),
            'name' => 'Season Role',
        ]);

        foreach (['AGRICULTURE.READ', 'AGRICULTURE.CREATE', 'AGRICULTURE.UPDATE'] as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm ' . $pCode, 'module' => 'Agriculture']
            );
            $role->permissions()->attach($permission->id);
        }

        $this->user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'season_user_' . Str::random(5),
            'email' => 'season_' . Str::random(5) . '@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Cán Bộ Kế Hoạch',
            'cooperative_id' => $this->coop->id,
            'status' => 'ACTIVE',
        ]);
        $this->user->roles()->attach($role->id);

        $this->member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->coop->id,
            'member_code' => 'MB-TEST-' . Str::random(4),
            'user_id' => $this->user->id,
            'status' => 'ACTIVE',
            'identity_information' => [
                'full_name' => 'Xã Viên Thử Nghiệm',
                'phone' => '0988776655',
            ],
        ]);

        $this->unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->coop->id,
            'unit_code' => 'PUC_TEST_' . Str::random(4),
            'name' => 'Vùng Canh Tác Thử Nghiệm',
            'crop' => 'Ớt chuông Sweet Palermo',
            'area' => 10.0,
            'status' => 'ACTIVE',
        ]);

        $this->plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $this->unit->id,
            'plot_code' => 'PLOT-TEST-' . Str::random(4),
            'area' => 3000.0,
            'status' => 'ACTIVE',
            'max_yield_rate_per_sqm' => 4.5,
        ]);

        $this->season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $this->unit->id,
            'name' => 'Vụ Mùa Thử Nghiệm 2026',
            'crop' => 'Ớt chuông Sweet Palermo',
            'start_date' => '2026-01-01',
            'expected_end_date' => '2026-10-31',
            'status' => 'ACTIVE',
            'puc_quota_kg' => 15000.0,
            'buyer_contract_info' => [
                'buyer_name' => 'Siêu thị Co.opMart',
                'target_volume_kg' => 13500.0,
                'contract_code' => 'HD-COOP-01',
            ],
        ]);

        $this->material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->coop->id,
            'sku' => 'MAT-TEST-' . Str::random(4),
            'name' => 'Phân Bón Hữu Cơ Vi Lượng',
            'category' => 'FERTILIZER',
            'unit' => 'bao_25kg',
            'status' => 'ACTIVE',
        ]);
    }

    public function test_can_allocate_plot_to_season(): void
    {
        $response = $this->actingAs($this->user)
            ->withHeader('X-Cooperative-Id', $this->coop->id)
            ->postJson("/api/v1/crop-seasons/{$this->season->id}/plots", [
                'plot_id' => $this->plot->id,
                'member_id' => $this->member->id,
                'allocated_area' => 3000.0,
                'crop_variety' => 'Sweet Palermo Đỏ F1',
                'planting_date' => '2026-01-15',
                'expected_harvest_start' => '2026-03-30',
                'expected_harvest_end' => '2026-10-31',
                'target_yield_kg' => 13500.0,
                'notes' => 'Thửa phân bổ đợt 1',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.plot_id', $this->plot->id);
        $response->assertJsonPath('data.crop_variety', 'Sweet Palermo Đỏ F1');
        $response->assertJsonPath('data.target_yield_kg', 13500.0);

        $this->assertDatabaseHas('crop_season_plots', [
            'crop_season_id' => $this->season->id,
            'plot_id' => $this->plot->id,
            'member_id' => $this->member->id,
        ]);
    }

    public function test_can_get_allocated_plots(): void
    {
        CropSeasonPlotModel::create([
            'crop_season_id' => $this->season->id,
            'plot_id' => $this->plot->id,
            'member_id' => $this->member->id,
            'allocated_area' => 3000.0,
            'crop_variety' => 'Sweet Palermo Đỏ F1',
            'planting_date' => '2026-01-15',
            'expected_harvest_start' => '2026-03-30',
            'expected_harvest_end' => '2026-10-31',
            'target_yield_kg' => 13500.0,
            'status' => 'PLANNED',
        ]);

        $response = $this->actingAs($this->user)
            ->withHeader('X-Cooperative-Id', $this->coop->id)
            ->getJson("/api/v1/crop-seasons/{$this->season->id}/plots");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.plot_code', $this->plot->plot_code);
    }

    public function test_can_save_and_get_season_boms(): void
    {
        $payload = [
            'items' => [
                [
                    'material_id' => $this->material->id,
                    'stage_phase' => 'VEGETATIVE',
                    'standard_rate_per_sqm' => 0.015,
                    'planned_quantity' => 45.0,
                    'estimated_unit_price' => 200000.0,
                    'estimated_total_cost' => 9000000.0,
                    'notes' => 'Bón thúc đợt 1',
                ],
            ],
        ];

        $saveResponse = $this->actingAs($this->user)
            ->withHeader('X-Cooperative-Id', $this->coop->id)
            ->postJson("/api/v1/crop-seasons/{$this->season->id}/boms", $payload);

        $saveResponse->assertStatus(200);
        $saveResponse->assertJsonCount(1, 'data');
        $saveResponse->assertJsonPath('data.0.planned_quantity', 45.0);
        $saveResponse->assertJsonPath('data.0.estimated_total_cost', 9000000.0);

        $getResponse = $this->actingAs($this->user)
            ->withHeader('X-Cooperative-Id', $this->coop->id)
            ->getJson("/api/v1/crop-seasons/{$this->season->id}/boms");

        $getResponse->assertStatus(200);
        $getResponse->assertJsonCount(1, 'data');
    }

    public function test_can_get_supply_demand_balance(): void
    {
        CropSeasonPlotModel::create([
            'crop_season_id' => $this->season->id,
            'plot_id' => $this->plot->id,
            'member_id' => $this->member->id,
            'allocated_area' => 3000.0,
            'crop_variety' => 'Sweet Palermo Đỏ F1',
            'planting_date' => '2026-01-15',
            'expected_harvest_start' => '2026-03-30',
            'expected_harvest_end' => '2026-10-31',
            'target_yield_kg' => 13500.0,
            'status' => 'HARVESTING',
        ]);

        $response = $this->actingAs($this->user)
            ->withHeader('X-Cooperative-Id', $this->coop->id)
            ->getJson("/api/v1/crop-seasons/{$this->season->id}/supply-demand");

        $response->assertStatus(200);
        $response->assertJsonPath('data.buyer_contract_quantity_kg', 13500.0);
        $response->assertJsonPath('data.total_committed_quantity_kg', 13500.0);
        $response->assertJsonPath('data.buyer_name', 'Siêu thị Co.opMart');
        $response->assertJsonPath('data.is_shortage', false);
    }
}
