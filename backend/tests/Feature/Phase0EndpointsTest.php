<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Tests\TestCase;

class Phase0EndpointsTest extends TestCase
{
    private UserModel $adminUser;
    private CooperativeModel $cooperative;
    private ProductionUnitModel $unit;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cooperative = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_P0_' . Str::random(4),
            'legal_name' => 'HTX Nông nghiệp Tân Tiến Phase 0',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_ADMIN_P0_' . Str::random(4),
            'name' => 'Admin Role Phase 0',
        ]);

        $permissions = ['AGRICULTURE.READ', 'AGRICULTURE.CREATE', 'AGRICULTURE.UPDATE', 'AGRICULTURE.DELETE', 'FINANCE.READ', 'OCOP.READ', 'OCOP.EVALUATION.READ'];
        foreach ($permissions as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm ' . $pCode, 'module' => 'Common']
            );
            $role->permissions()->attach($permission->id);
        }

        $this->adminUser = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'admin_p0_' . Str::random(4),
            'email' => 'admin_p0_' . Str::random(4) . '@htxtantien.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Admin Phase 0',
            'cooperative_id' => $this->cooperative->id,
            'status' => 'ACTIVE',
        ]);
        $this->adminUser->roles()->attach($role->id);

        $this->unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->cooperative->id,
            'unit_code' => 'VT_P0_' . Str::random(4),
            'name' => 'Vùng trồng Test Phase 0',
            'crop' => 'Ớt chuông Sweet Palermo',
            'area' => 10.0,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_can_list_ocop_decisions(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/ocop/decisions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message',
            ]);
    }

    public function test_can_update_farm_plot(): void
    {
        $plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $this->unit->id,
            'plot_code' => 'PLOT-P0-' . Str::random(4),
            'area' => 3.5,
            'status' => 'ACTIVE',
            'land_relation' => ['puc_code' => 'PUC-TEST-01'],
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->patchJson("/api/v1/farm-plots/{$plot->id}", [
                'area' => 5.2,
                'status' => 'PREPARING',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.area', 5.2);

        $this->assertDatabaseHas('farm_plots', [
            'id' => $plot->id,
            'area' => 5.2,
            'status' => 'PREPARING',
        ]);
    }

    public function test_can_delete_unused_farm_plot(): void
    {
        $plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $this->unit->id,
            'plot_code' => 'PLOT-DEL-' . Str::random(4),
            'area' => 1.5,
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/farm-plots/{$plot->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('farm_plots', ['id' => $plot->id]);
    }

    public function test_can_list_harvest_settlements(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/harvests/settlements');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message',
            ]);
    }
}
