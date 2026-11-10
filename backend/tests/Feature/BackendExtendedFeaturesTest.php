<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestRecordModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\LandContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MeetingModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\VoteModel;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Finance\Infrastructure\Persistence\Models\ReceivablePayableModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\WarehouseModel;
use Tests\TestCase;

class BackendExtendedFeaturesTest extends TestCase
{
    private CooperativeModel $cooperative;
    private UserModel $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cooperative = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_EXT_' . Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp Mở Rộng',
            'display_name' => 'HTX Mở Rộng',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_SUPER_ADMIN_' . Str::random(4),
            'name' => 'Super Admin Role',
        ]);

        $permissions = [
            'AGRICULTURE.READ', 'AGRICULTURE.CREATE', 'AGRICULTURE.UPDATE', 'AGRICULTURE.DELETE',
            'MEMBER.READ', 'MEMBER.CREATE', 'MEMBER.UPDATE', 'MEMBER.DELETE',
            'INVENTORY.READ', 'INVENTORY.CREATE', 'INVENTORY.UPDATE', 'INVENTORY.DELETE',
            'FINANCE.READ', 'FINANCE.CREATE', 'FINANCE.UPDATE',
            'REPORT.READ',
            'AUDIT.READ',
        ];

        foreach ($permissions as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm ' . $pCode, 'module' => 'Common']
            );
            $role->permissions()->attach($permission->id);
        }

        $this->adminUser = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'admin_ext_' . Str::random(4),
            'email' => 'admin_ext_' . Str::random(4) . '@htxext.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Admin Mở Rộng',
            'cooperative_id' => $this->cooperative->id,
            'status' => 'ACTIVE',
        ]);

        $this->adminUser->roles()->attach($role->id);
    }

    private function createMember(string $code = null): MemberModel
    {
        return MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->cooperative->id,
            'member_code' => $code ?: 'MB_' . Str::random(5),
            'status' => 'ACTIVE',
            'member_type' => 'OFFICIAL',
            'admission_date' => now()->toDateString(),
            'identity_information' => [
                'full_name' => 'Nguyễn Văn ' . Str::random(4),
                'citizen_id' => '07920' . rand(1000000, 9999999),
                'phone' => '090' . rand(1000000, 9999999),
                'address' => 'Xã Tân Tiến, Huyện Đầm Dơi, Cà Mau',
            ],
            'committed_capital' => 10000000,
            'contributed_capital' => 10000000,
        ]);
    }

    public function test_farm_plots_flat_list_and_filter(): void
    {
        $unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->cooperative->id,
            'unit_code' => 'PUC_' . Str::random(4),
            'name' => 'Vùng Ớt Chuông Palermo',
            'crop' => 'Sweet Palermo',
            'area' => 5.0,
            'status' => 'ACTIVE',
        ]);

        $plot1 = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => 'PL_A1_' . Str::random(3),
            'area' => 1.5,
            'status' => 'ACTIVE',
        ]);

        $plot2 = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => 'PL_A2_' . Str::random(3),
            'area' => 2.0,
            'status' => 'PREPARING',
        ]);

        // GET all flat plots
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/farm-plots');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertGreaterThanOrEqual(2, count($response->json('data')));

        // Filter by status
        $filterResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/farm-plots?status=PREPARING');

        $filterResponse->assertStatus(200);
        foreach ($filterResponse->json('data') as $item) {
            $this->assertEquals('PREPARING', $item['status']);
        }
    }

    public function test_farm_plots_by_member(): void
    {
        $member = $this->createMember();

        $unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->cooperative->id,
            'unit_code' => 'PUC_' . Str::random(4),
            'name' => 'Vùng Lúa Hữu Cơ',
            'crop' => 'Lúa ST25',
            'area' => 8.0,
            'status' => 'ACTIVE',
        ]);

        $plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => 'PL_MEM_' . Str::random(3),
            'area' => 2.5,
            'status' => 'ACTIVE',
            'land_relation' => [
                'ownership_type' => 'MEMBER_OWNED',
                'owner_id' => $member->id,
            ],
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/members/{$member->id}/plots");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertNotEmpty($response->json('data'));
        $this->assertEquals($plot->id, $response->json('data.0.id'));
    }

    public function test_farming_log_delete_success_and_protection(): void
    {
        $unit = ProductionUnitModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->cooperative->id,
            'unit_code' => 'PUC_' . Str::random(4),
            'name' => 'Vùng Test Xóa Log',
            'crop' => 'Ớt chuông',
            'area' => 3.0,
            'status' => 'ACTIVE',
        ]);

        $plot = FarmPlotModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'plot_code' => 'PL_DEL_' . Str::random(3),
            'area' => 1.0,
            'status' => 'ACTIVE',
        ]);

        $season = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Vụ Hè Thu 2026',
            'crop' => 'Ớt chuông',
            'start_date' => '2026-05-01',
            'expected_end_date' => '2026-09-01',
            'status' => 'ACTIVE',
        ]);

        $log = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $season->id,
            'plot_id' => $plot->id,
            'activity_type' => 'WATERING',
            'activity_date' => '2026-06-01',
            'description' => 'Tưới nước nhỏ giọt buổi sáng',
        ]);

        // Success delete
        $delResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/farming-logs/{$log->id}");

        $delResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('farming_logs', ['id' => $log->id]);

        // Protection check: Cannot delete when season is COMPLETED
        $completedSeason = CropSeasonModel::create([
            'id' => (string) Str::uuid(),
            'production_unit_id' => $unit->id,
            'name' => 'Vụ Đã Đóng 2025',
            'crop' => 'Ớt chuông',
            'start_date' => '2025-01-01',
            'expected_end_date' => '2025-05-01',
            'status' => 'COMPLETED',
        ]);

        $lockedLog = FarmingLogModel::create([
            'id' => (string) Str::uuid(),
            'crop_season_id' => $completedSeason->id,
            'plot_id' => $plot->id,
            'activity_type' => 'HARVESTING',
            'activity_date' => '2025-04-20',
            'description' => 'Thu hoạch cuối vụ',
        ]);

        $rejectResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/farming-logs/{$lockedLog->id}");

        $rejectResponse->assertStatus(400)
            ->assertJsonPath('error.code', 'SEASON_CLOSED');
    }

    public function test_warehouse_crud_and_validation(): void
    {
        // 1. Create warehouse
        $createResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/warehouses', [
                'warehouse_code' => 'WH_MAIN_' . Str::random(4),
                'name' => 'Kho Tổng Vật Tư Nông Nghiệp',
                'location' => 'Khu A - Tân Tiến',
                'status' => 'ACTIVE',
            ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('success', true);
        $warehouseId = $createResponse->json('data.id');

        // 2. List warehouses
        $listResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/warehouses');

        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertNotEmpty($listResponse->json('data'));

        // 3. Show warehouse
        $showResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/warehouses/{$warehouseId}");

        $showResponse->assertStatus(200)
            ->assertJsonPath('data.name', 'Kho Tổng Vật Tư Nông Nghiệp');

        // 4. Update warehouse
        $updateResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->patchJson("/api/v1/warehouses/{$warehouseId}", [
                'name' => 'Kho Tổng Vật Tư & Phân Bón',
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.name', 'Kho Tổng Vật Tư & Phân Bón');

        // 5. Delete warehouse
        $delResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/warehouses/{$warehouseId}");

        $delResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('warehouses', ['id' => $warehouseId]);
    }

    public function test_notifications_list_and_read_actions(): void
    {
        // Seed unread notifications in database notifications table
        $notifId1 = (string) Str::uuid();
        $notifId2 = (string) Str::uuid();

        DB::table('notifications')->insert([
            [
                'id' => $notifId1,
                'type' => 'Modules\Notification\Domain\Notifications\GeneralNotification',
                'notifiable_type' => UserModel::class,
                'notifiable_id' => $this->adminUser->id,
                'data' => json_encode(['title' => 'Cảnh báo PHI', 'message' => 'Lô Ớt sắp đến ngày thu hoạch']),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $notifId2,
                'type' => 'Modules\Notification\Domain\Notifications\GeneralNotification',
                'notifiable_type' => UserModel::class,
                'notifiable_id' => $this->adminUser->id,
                'data' => json_encode(['title' => 'Duyệt hồ sơ OCOP', 'message' => 'Hội đồng đã chấm điểm']),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 1. Get notifications list with unread_count
        $listResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/notifications');

        $listResponse->assertStatus(200)
            ->assertJsonPath('meta.unread_count', 2);

        // 2. Mark single notification as read
        $markOneResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/notifications/{$notifId1}/mark-as-read");

        $markOneResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertNotNull(DB::table('notifications')->where('id', $notifId1)->value('read_at'));

        // 3. Mark all as read
        $markAllResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/notifications/mark-all-read');

        $markAllResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertEquals(0, DB::table('notifications')->where('notifiable_id', $this->adminUser->id)->whereNull('read_at')->count());
    }

    public function test_member_nested_identity_update(): void
    {
        $member = $this->createMember();

        $updatePayload = [
            'identity_information' => [
                'full_name' => 'Nguyễn Văn Đạt',
                'phone' => '0912345678',
            ],
            'emergency_contact' => [
                'name' => 'Trần Thị Mai',
                'relationship' => 'Vợ',
                'phone' => '0987654321',
            ],
            'bank_account_info' => [
                'bank_name' => 'Agribank Chi nhánh Đầm Dơi',
                'account_number' => '7500205123456',
                'account_holder' => 'NGUYEN VAN DAT',
            ],
            'health_status' => 'GOOD',
            'family_situation' => 'Hộ nông dân sản xuất kinh doanh giỏi',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->patchJson("/api/v1/members/{$member->id}", $updatePayload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $refreshed = MemberModel::find($member->id);
        $identity = $refreshed->identity_information;

        $this->assertEquals('Nguyễn Văn Đạt', $identity['full_name']);
        $this->assertEquals('Trần Thị Mai', $identity['emergency_contact']['name']);
        $this->assertEquals('Agribank Chi nhánh Đầm Dơi', $identity['bank_account_info']['bank_name']);
        $this->assertEquals('GOOD', $identity['health_status']);
    }

    public function test_meetings_and_voting_flow(): void
    {
        // 1. Create meeting
        $createMeetingResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/meetings', [
                'meeting_type' => 'ANNUAL',
                'meeting_date' => '2026-12-15',
                'title' => 'Đại hội thường niên HTX năm 2026',
                'description' => 'Thông qua phương án phân chia lợi nhuận và bầu ban kiểm soát',
                'status' => 'IN_PROGRESS',
            ]);

        $createMeetingResponse->assertStatus(201)
            ->assertJsonPath('success', true);
        $meetingId = $createMeetingResponse->json('data.id');

        // 2. Cast vote
        $voteResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/meetings/{$meetingId}/votes", [
                'resolution_code' => 'NQ-2026-01',
                'choice' => 'FOR',
                'weight' => 1.0,
            ]);

        $voteResponse->assertStatus(201)
            ->assertJsonPath('success', true);

        // 3. Duplicate vote rejection (Anti-duplicate voting check)
        $duplicateResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/meetings/{$meetingId}/votes", [
                'resolution_code' => 'NQ-2026-01',
                'choice' => 'AGAINST',
            ]);

        $duplicateResponse->assertStatus(409)
            ->assertJsonPath('error.code', 'DUPLICATE_VOTE');

        // 4. Resolutions summary
        $summaryResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/meetings/{$meetingId}/resolutions-summary");

        $summaryResponse->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertNotEmpty($summaryResponse->json('data'));
        $this->assertEquals('NQ-2026-01', $summaryResponse->json('data.0.resolution_code'));
        $this->assertEquals('REGULAR', $summaryResponse->json('data.0.resolution_type'));
        $this->assertEquals(50.0, (float) $summaryResponse->json('data.0.required_percentage'));
        $this->assertTrue($summaryResponse->json('data.0.is_approved'));
        $this->assertEquals(1, $summaryResponse->json('data.0.for_count'));

        // 5. Critical resolution test (requires >= 75% per Luật HTX 2023 Điều 72)
        $user2 = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'member_voter_' . Str::random(4),
            'email' => 'voter_' . Str::random(4) . '@htx.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Xã viên 2',
            'cooperative_id' => $this->cooperative->id,
            'status' => 'ACTIVE',
        ]);

        // User 1 votes FOR (weight 60), User 2 votes AGAINST (weight 40) => approval = 60% < 75% => NOT approved
        $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/meetings/{$meetingId}/votes", [
                'resolution_code' => 'NQ-DIEULE-01',
                'resolution_type' => 'CRITICAL',
                'choice' => 'FOR',
                'weight' => 60.0,
            ])->assertStatus(201);

        $this->actingAs($user2, 'sanctum')
            ->postJson("/api/v1/meetings/{$meetingId}/votes", [
                'resolution_code' => 'NQ-DIEULE-01',
                'resolution_type' => 'CRITICAL',
                'choice' => 'AGAINST',
                'weight' => 40.0,
            ])->assertStatus(201);

        $criticalSummary = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/meetings/{$meetingId}/resolutions-summary");

        $critRes = collect($criticalSummary->json('data'))->firstWhere('resolution_code', 'NQ-DIEULE-01');
        $this->assertNotNull($critRes);
        $this->assertEquals('CRITICAL', $critRes['resolution_type']);
        $this->assertEquals(75.0, (float) $critRes['required_percentage']);
        $this->assertEquals(60.0, (float) $critRes['approval_percentage']);
        $this->assertFalse($critRes['is_approved']); // 60% < 75% -> False
    }

    public function test_land_contribution_crud(): void
    {
        $member = $this->createMember();

        // 1. Create land contribution
        $createResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/members/{$member->id}/land-contributions", [
                'land_certificate_no' => 'CN-QSD-2026-0889',
                'plot_number' => '102',
                'map_sheet_number' => '15',
                'land_area_sqm' => 5000.0,
                'land_use_type' => 'Đất trồng trọt lâu năm',
                'appraised_unit_price' => 50000,
                'cadastral_status' => 'NOTARIZED',
            ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_land_value', 250000000); // 5000 * 50,000

        $landId = $createResponse->json('data.id');

        // 2. List member's land contributions
        $listResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/members/{$member->id}/land-contributions");

        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertCount(1, $listResponse->json('data'));

        // 3. Delete land contribution
        $delResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/land-contributions/{$landId}");

        $delResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('land_contributions', ['id' => $landId]);
    }

    public function test_receivable_payable_aging_summary(): void
    {
        // Receivable 1: Current (due in future)
        ReceivablePayableModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->cooperative->id,
            'debt_code' => 'AR_' . Str::random(4),
            'debt_type' => 'RECEIVABLE',
            'counterparty_type' => 'BUYER',
            'counterparty_name' => 'Công ty Xuất Khẩu Nông Sản',
            'original_amount' => 50000000,
            'outstanding_amount' => 50000000,
            'due_date' => now()->addDays(10)->toDateString(),
            'status' => 'PENDING',
        ]);

        // Receivable 2: Overdue by 15 days (bucket 1_to_30_days)
        ReceivablePayableModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->cooperative->id,
            'debt_code' => 'AR_' . Str::random(4),
            'debt_type' => 'RECEIVABLE',
            'counterparty_type' => 'MEMBER',
            'counterparty_name' => 'Xã viên nợ vật tư',
            'original_amount' => 15000000,
            'outstanding_amount' => 15000000,
            'due_date' => now()->subDays(15)->toDateString(),
            'status' => 'PENDING',
        ]);

        // Payable: Overdue by 45 days (bucket 31_to_60_days)
        ReceivablePayableModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->cooperative->id,
            'debt_code' => 'AP_' . Str::random(4),
            'debt_type' => 'PAYABLE',
            'counterparty_type' => 'SUPPLIER',
            'counterparty_name' => 'Công ty Cổ phần Phân bón Cà Mau',
            'original_amount' => 30000000,
            'outstanding_amount' => 30000000,
            'due_date' => now()->subDays(45)->toDateString(),
            'status' => 'PENDING',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/receivable-payables/summary');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');

        $this->assertEquals(65000000, $data['total_receivable']);
        $this->assertEquals(15000000, $data['overdue_receivable']);
        $this->assertEquals(30000000, $data['total_payable']);
        $this->assertEquals(30000000, $data['overdue_payable']);
        $this->assertEquals(35000000, $data['net_debt_position']);
        $this->assertEquals(50000000, $data['aging_breakdown']['current']);
        $this->assertEquals(15000000, $data['aging_breakdown']['overdue_1_30']);
        $this->assertEquals(30000000, $data['aging_breakdown']['overdue_31_60']);
    }

    public function test_server_side_openxml_excel_export(): void
    {
        $this->createMember('MB_EXP_01');
        $this->createMember('MB_EXP_02');

        // Export Members spreadsheet
        $responseMembers = $this->actingAs($this->adminUser, 'sanctum')
            ->get('/api/v1/reports/export/members');

        $responseMembers->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $responseMembers->headers->get('Content-Type'));
        $this->assertStringContainsString('danh_ba_xa_vien_', $responseMembers->headers->get('Content-Disposition'));

        // Export Cash Book spreadsheet
        $responseCashBook = $this->actingAs($this->adminUser, 'sanctum')
            ->get('/api/v1/reports/export/cash-book');

        $responseCashBook->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $responseCashBook->headers->get('Content-Type'));
        $this->assertStringContainsString('so_quy_tien_mat_', $responseCashBook->headers->get('Content-Disposition'));
    }

    public function test_auth_change_password(): void
    {
        // 1. Wrong current password rejection
        $wrongResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/auth/change-password', [
                'current_password' => 'wrong_pwd_999',
                'new_password' => 'newSecret@123',
                'new_password_confirmation' => 'newSecret@123',
            ]);

        $wrongResponse->assertStatus(422)
            ->assertJsonPath('error.code', 'INVALID_CURRENT_PASSWORD');

        // 2. Successful password change
        $successResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/auth/change-password', [
                'current_password' => 'password123',
                'new_password' => 'newSecret@123',
                'new_password_confirmation' => 'newSecret@123',
            ]);

        $successResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        // Verify database password hash changed
        $refreshedUser = UserModel::find($this->adminUser->id);
        $this->assertTrue(Hash::check('newSecret@123', $refreshedUser->password));
    }

    public function test_member_audit_trace(): void
    {
        $member = $this->createMember();

        // Log an audit event for this member
        AuditEventModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $this->cooperative->id,
            'user_id' => $this->adminUser->id,
            'action' => 'MEMBER_REGISTERED',
            'entity_type' => 'Member',
            'entity_id' => $member->id,
            'old_values' => null,
            'new_values' => ['member_code' => $member->member_code],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/audit-logs/trace/member/{$member->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertEquals($member->id, $response->json('data.member.id'));
        $this->assertNotEmpty($response->json('data.audit_timeline'));
        $this->assertEquals('MEMBER_REGISTERED', $response->json('data.audit_timeline.0.action'));
    }

    public function test_suggested_credit_limit_calculation(): void
    {
        $member = $this->createMember();

        // 1. Initially without plots/land: area = 0 -> suggested limit = 0
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/members/{$member->id}/suggested-credit-limit");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertEquals(0, (float) $response->json('data.suggested_credit_limit'));

        // 2. Add land contribution: 20,000 sqm = 2.0 ha
        $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/members/{$member->id}/land-contributions", [
                'land_certificate_no' => 'CN-QSD-2026-9999',
                'plot_number' => '88',
                'map_sheet_number' => '10',
                'land_area_sqm' => 20000.0,
                'land_use_type' => 'Đất lúa tôm kết hợp',
                'appraised_unit_price' => 50000,
                'cadastral_status' => 'NOTARIZED',
            ])->assertStatus(201);

        $responseWithLand = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/members/{$member->id}/suggested-credit-limit");

        $responseWithLand->assertStatus(200);
        $this->assertEquals(2.0, (float) $responseWithLand->json('data.total_area_ha'));
        // 2 ha * 15,000,000 = 30,000,000 VND
        $this->assertEquals(30000000, (float) $responseWithLand->json('data.suggested_credit_limit'));
        $this->assertTrue($responseWithLand->json('data.can_override'));
    }
}
