<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Tests\TestCase;

class AgricultureInfrastructureTest extends TestCase
{
    private function createCooperative(string $code = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'HTX_AGRI_' . Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp Thử Nghiệm Vùng Trồng',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop, array $permissionCodes): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_AGRI_TEST_' . Str::random(4),
            'name' => 'Agri Test Role',
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
            'username' => 'agri_user_' . Str::random(5),
            'email' => 'agri_user_' . Str::random(5) . '@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Cán Bộ Nông Nghiệp',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    // --- PRODUCTION UNIT TESTS ---

    public function test_create_production_unit_successfully(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE', 'AGRICULTURE.READ']);

        $payload = [
            'unit_code' => 'PUC_XA_CAU',
            'name' => 'Vùng trồng Vải Thiều Xã Cầu',
            'crop' => 'Vải Thiều',
            'area' => 25.5000,
            'location' => ['province' => 'Hải Dương', 'district' => 'Thanh Hà'],
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/production-units', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.unit_code', 'PUC_XA_CAU');
        $response->assertJsonPath('data.area', 25.5);

        $this->assertDatabaseHas('production_units', [
            'cooperative_id' => $coop->id,
            'unit_code' => 'PUC_XA_CAU',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'PRODUCTION_UNIT_CREATED',
            'cooperative_id' => $coop->id,
        ]);
    }

    public function test_create_production_unit_fails_when_unit_code_duplicated(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE']);

        ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'unit_code' => 'PUC_DUP',
            'name' => 'Vùng trồng Cũ',
            'crop' => 'Nhãn',
            'area' => 10.0,
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['X-Cooperative-ID' => $coop->id])
            ->postJson('/api/v1/production-units', [
                'unit_code' => 'PUC_DUP',
                'name' => 'Vùng trồng Mới Trùng',
                'crop' => 'Nhãn',
                'area' => 5.0,
            ]);

        $response->assertStatus(409);
        $response->assertJsonPath('error.code', 'DUPLICATE_UNIT_CODE');
    }

    public function test_list_production_units_with_search_and_tenant_scope(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.READ']);

        ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'unit_code' => 'PUC_CAM_1',
            'name' => 'Vùng trồng Cam Vinh',
            'crop' => 'Cam',
            'area' => 15.0,
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['X-Cooperative-ID' => $coop->id])
            ->getJson('/api/v1/production-units?search=Cam');

        $response->assertStatus(200);
        $response->assertJsonPath('meta.total', 1);
        $response->assertJsonPath('data.0.unit_code', 'PUC_CAM_1');
    }

    // --- FARM PLOT TESTS ---

    public function test_create_farm_plot_under_production_unit_successfully(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.CREATE', 'AGRICULTURE.READ']);

        $unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'unit_code' => 'PUC_LITCHI',
            'name' => 'Vùng Vải Thanh Hà',
            'crop' => 'Vải',
            'area' => 50.0,
            'status' => 'ACTIVE',
        ]);

        $payload = [
            'plot_code' => 'PLOT_01',
            'area' => 2.5000,
            'land_relation' => ['owner_name' => 'Nguyễn Văn A'],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['X-Cooperative-ID' => $coop->id])
            ->postJson("/api/v1/production-units/{$unit->id}/plots", $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.plot_code', 'PLOT_01');
        $response->assertJsonPath('data.area', 2.5);

        $this->assertDatabaseHas('farm_plots', [
            'production_unit_id' => $unit->id,
            'plot_code' => 'PLOT_01',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'FARM_PLOT_CREATED',
            'cooperative_id' => $coop->id,
        ]);
    }

    public function test_assign_member_to_farm_plot_successfully(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['AGRICULTURE.UPDATE', 'AGRICULTURE.READ']);

        $unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'unit_code' => 'PUC_ASSIGN',
            'name' => 'Vùng Sản Xuất A',
            'crop' => 'Lúa',
            'area' => 10.0,
            'status' => 'ACTIVE',
        ]);

        $plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => 'PLOT_ASSIGN_1',
            'area' => 1.5,
            'status' => 'ACTIVE',
        ]);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_FARMER_1',
            'identity_information' => ['full_name' => 'Nông Dân Canh Tác'],
            'status' => 'ACTIVE',
        ]);

        $payload = [
            'member_id' => $member->id,
            'assignment_type' => 'PRIMARY_FARMER',
            'start_date' => '2026-01-01',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['X-Cooperative-ID' => $coop->id])
            ->postJson("/api/v1/farm-plots/{$plot->id}/member-assignments", $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.member_id', $member->id);

        $this->assertDatabaseHas('member_plot_assignments', [
            'plot_id' => $plot->id,
            'member_id' => $member->id,
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'MEMBER_PLOT_ASSIGNED',
            'cooperative_id' => $coop->id,
        ]);
    }

    public function test_cross_tenant_isolation_prevents_accessing_other_cooperative_production_unit(): void
    {
        $coopA = $this->createCooperative('HTX_AGRI_A');
        $coopB = $this->createCooperative('HTX_AGRI_B');

        $userA = $this->createUserWithPermissions($coopA, ['AGRICULTURE.READ']);

        $unitB = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopB->id,
            'unit_code' => 'PUC_COOP_B',
            'name' => 'Vùng Sản Xuất B',
            'crop' => 'Ngô',
            'area' => 5.0,
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($userA, 'sanctum')
            ->withHeaders(['X-Cooperative-ID' => $coopA->id])
            ->getJson("/api/v1/production-units/{$unitB->id}");

        $response->assertStatus(404);
        $response->assertJsonPath('error.code', 'PRODUCTION_UNIT_NOT_FOUND');
    }
}
