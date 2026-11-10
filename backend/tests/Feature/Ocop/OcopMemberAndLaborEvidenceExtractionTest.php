<?php

namespace Tests\Feature\Ocop;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\MemberPlotAssignmentModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaGroupModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriterionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evidence\Application\Services\OcopEvidenceAutoExtractionService;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class OcopMemberAndLaborEvidenceExtractionTest extends TestCase
{
    private function createCoopAndAppContext(string $codePrefix = 'TEST'): array
    {
        $coop = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => "COOP-{$codePrefix}-" . Str::random(4),
            'legal_name' => "Hợp tác xã Nông nghiệp {$codePrefix}",
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::firstOrCreate(
            ['name' => 'COOP_ADMIN'],
            ['id' => (string) Str::uuid(), 'code' => 'COOP_ADMIN', 'display_name' => 'Admin HTX', 'description' => 'Admin']
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => "user_{$codePrefix}_" . Str::random(4),
            'email' => "user_{$codePrefix}_" . Str::random(4) . '@htx.vn',
            'password' => Hash::make('Secret123!'),
            'full_name' => "Quản trị viên {$codePrefix}",
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);
        $user->roles()->attach($role->id);

        $token = $user->createToken('test_token')->plainTextToken;

        $product = ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'product_code' => "PROD-{$codePrefix}-01",
            'product_name' => "Ớt Chuông Sweet Palermo {$codePrefix}",
            'category' => 'FOOD',
            'status' => 'ACTIVE',
        ]);

        $version = CriteriaVersionModel::firstOrCreate(
            ['version_code' => 'QD148-STANDARD'],
            ['id' => (string) Str::uuid(), 'name' => 'Bộ Tiêu Chí QĐ 148', 'status' => 'PUBLISHED']
        );

        $group = CriteriaGroupModel::firstOrCreate(
            ['code' => 'GRP-A', 'criteria_version_id' => $version->id],
            ['id' => (string) Str::uuid(), 'name' => 'Sức mạnh cộng đồng']
        );

        $crit = CriterionModel::firstOrCreate(
            ['code' => 'CRIT-A.2', 'criteria_group_id' => $group->id],
            ['id' => (string) Str::uuid(), 'name' => 'Lao động và liên kết chuỗi', 'max_score' => 15.0]
        );

        $indA21 = IndicatorModel::firstOrCreate(
            ['code' => 'TC-A.2.1'],
            ['id' => (string) Str::uuid(), 'criterion_id' => $crit->id, 'name' => 'Tỷ lệ lao động địa phương có hợp đồng hoặc thành viên HTX', 'max_score' => 5.0]
        );

        $indA31 = IndicatorModel::firstOrCreate(
            ['code' => 'TC-A.3.1'],
            ['id' => (string) Str::uuid(), 'criterion_id' => $crit->id, 'name' => 'Năng lực liên kết chuỗi giá trị tiêu thụ sản phẩm', 'max_score' => 10.0]
        );

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => "APP-{$codePrefix}-" . Str::random(4),
            'current_stage' => 'INTERNAL_PREPARATION',
            'status' => 'DRAFT',
            'created_by' => $user->id,
        ]);

        return [
            'coop' => $coop,
            'user' => $user,
            'token' => $token,
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ],
            'product' => $product,
            'app' => $app,
            'indA21' => $indA21,
            'indA31' => $indA31,
        ];
    }

    public function test_extract_local_labor_evidence_success(): void
    {
        Storage::fake('local');
        $ctx = $this->createCoopAndAppContext('LABOR');

        // Create 5 members (4 local Lâm Hà, 1 foreign)
        for ($i = 1; $i <= 5; $i++) {
            $isLocal = $i <= 4;
            MemberModel::create([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $ctx['coop']->id,
                'member_code' => "TV-LABOR-{$i}",
                'identity_information' => [
                    'full_name' => "Xã Viên {$i}",
                    'citizen_id' => "04910000000{$i}",
                    'ward' => $isLocal ? 'Xã Tân Hà' : 'Xã Ngoại Tỉnh',
                    'district' => $isLocal ? 'Huyện Lâm Hà' : 'Huyện Khác',
                    'province' => $isLocal ? 'Tỉnh Lâm Đồng' : 'Tỉnh Khác',
                ],
                'member_type' => 'OFFICIAL',
                'status' => 'ACTIVE',
            ]);
        }

        $response = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/extract-evidence", [
                'extraction_type' => 'LOCAL_LABOR',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $title = $response->json('data.title');
        $this->assertStringContainsString('lao động địa phương', strtolower($title));
        $this->assertStringContainsString('5', $title); // 5 members
        $this->assertNotEmpty($response->json('data.current_version.checksum'));

        $this->assertDatabaseHas('audit_events', [
            'action' => 'EVIDENCE_AUTO_EXTRACTED',
            'cooperative_id' => $ctx['coop']->id,
        ]);
    }

    public function test_extract_member_chain_filters_by_production_unit(): void
    {
        Storage::fake('local');
        $ctx = $this->createCoopAndAppContext('CHAIN');

        // Create 2 production units
        $unit1 = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $ctx['coop']->id,
            'unit_code' => 'PUC-UNIT-01',
            'name' => 'Vùng Canh Tác Ớt Chuông Đỏ',
            'crop' => 'Ớt chuông Sweet Palermo Đỏ',
            'area' => 10.0,
            'status' => 'ACTIVE',
        ]);

        $unit2 = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $ctx['coop']->id,
            'unit_code' => 'PUC-UNIT-02',
            'name' => 'Vùng Chuyên Canh Cà Phê',
            'crop' => 'Cà phê Robusta',
            'area' => 5.0,
            'status' => 'ACTIVE',
        ]);

        // Create Member 1 assigned to Unit 1
        $member1 = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $ctx['coop']->id,
            'member_code' => 'TV-CHAIN-01',
            'identity_information' => [
                'full_name' => 'Nông Hộ Ớt Chuông 1',
                'citizen_id' => '049100000011',
            ],
            'member_type' => 'OFFICIAL',
            'status' => 'ACTIVE',
        ]);

        $plot1 = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit1->id,
            'plot_code' => 'PLOT-U1-01',
            'area' => 4.5,
            'status' => 'ACTIVE',
            'max_yield_rate_per_sqm' => 5.0,
        ]);

        MemberPlotAssignmentModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $member1->id,
            'plot_id' => $plot1->id,
            'assignment_type' => 'OWNER',
            'status' => 'ACTIVE',
        ]);

        // Request extraction specifically for Unit 1
        $response = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/extract-evidence", [
                'extraction_type' => 'MEMBER_CHAIN',
                'production_unit_id' => $unit1->id,
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $title = $response->json('data.title');
        $this->assertStringContainsString('PUC-UNIT-01', $title);
        $this->assertStringContainsString('1 hộ', $title);
        $this->assertStringContainsString('4.50 ha', $title);
    }

    public function test_tenant_isolation_blocks_cross_coop_member_evidence(): void
    {
        Storage::fake('local');
        $ctxA = $this->createCoopAndAppContext('COOP_A');
        $ctxB = $this->createCoopAndAppContext('COOP_B');

        // User from Coop B tries to extract evidence for Coop A's application -> 404 / 403
        $response = $this->withHeaders($ctxB['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctxA['app']->id}/extract-evidence", [
                'extraction_type' => 'LOCAL_LABOR',
            ]);

        // Eloquent Global Scope or tenant isolation blocks access to other coop's application
        $this->assertTrue(in_array($response->status(), [403, 404]));
    }
}
