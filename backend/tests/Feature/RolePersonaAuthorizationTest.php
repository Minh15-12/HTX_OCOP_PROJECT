<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class RolePersonaAuthorizationTest extends TestCase
{
    private CooperativeModel $cooperative;
    private UserModel $sysAdmin;
    private UserModel $htxOwner;
    private UserModel $accountant;
    private UserModel $storekeeper;
    private UserModel $ocopPreparer;
    private UserModel $evaluator;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Seed Roles and Permissions
        $this->artisan('db:seed', ['--class' => 'SystemReferenceSeeder']);
        $this->artisan('db:seed', ['--class' => 'UserSeeder']);

        // 2. Fetch seeded persona users
        $this->cooperative = CooperativeModel::first();
        $this->sysAdmin = UserModel::where('username', 'sys_admin')->firstOrFail();
        $this->htxOwner = UserModel::where('username', 'admin_htx')->firstOrFail();
        $this->accountant = UserModel::where('username', 'ketoan01')->firstOrFail();
        $this->storekeeper = UserModel::where('username', 'thukho01')->firstOrFail();
        $this->ocopPreparer = UserModel::where('username', 'chuyenvien_ocop01')->firstOrFail();
        $this->evaluator = UserModel::where('username', 'danhgia01')->firstOrFail();
    }

    public function test_accountant_can_access_finance_but_forbidden_from_user_admin_and_self_approval(): void
    {
        // 1. Kế toán được phép xem danh sách sổ quỹ
        $response = $this->actingAs($this->accountant, 'sanctum')
            ->getJson('/api/v1/cash-transactions');
        $response->assertStatus(200);

        // 2. Kế toán được phép tạo phiếu thu/chi mới (DRAFT)
        $txResponse = $this->actingAs($this->accountant, 'sanctum')
            ->postJson('/api/v1/cash-transactions', [
                'transaction_type' => 'EXPENSE',
                'amount' => 5000000,
                'transaction_date' => '2026-10-20',
                'category' => 'Vật tư đóng gói bao bì OCOP',
                'description' => 'Chi mua màng bọc thực phẩm cho dưa lưới',
                'payer_payee' => 'Công ty Bao Bì Xanh',
            ]);
        $txResponse->assertStatus(201);
        $txId = $txResponse->json('data.id');

        // 3. SoD Invariant: Kế toán KHÔNG ĐƯỢC tự duyệt phiếu chi của mình (bị 403 Forbidden)
        $approveResponse = $this->actingAs($this->accountant, 'sanctum')
            ->postJson("/api/v1/cash-transactions/{$txId}/approve");
        $approveResponse->assertStatus(403);

        // 4. Chủ tịch HTX (HTX_OWNER) có thẩm quyền duyệt phiếu chi thành công
        $ownerApproveResponse = $this->actingAs($this->htxOwner, 'sanctum')
            ->postJson("/api/v1/cash-transactions/{$txId}/approve");
        $ownerApproveResponse->assertStatus(200);

        // 5. Kế toán bị cấm xem danh sách tài khoản người dùng hệ thống (403 Forbidden)
        $usersResponse = $this->actingAs($this->accountant, 'sanctum')
            ->getJson('/api/v1/users');
        $usersResponse->assertStatus(403);

        // 6. Kế toán bị cấm sửa đổi ma trận phân quyền hệ thống (403 Forbidden)
        $role = RoleModel::where('code', 'ACCOUNTANT')->first();
        $permResponse = $this->actingAs($this->accountant, 'sanctum')
            ->putJson("/api/v1/roles/{$role->id}/permissions", ['permissions' => []]);
        $permResponse->assertStatus(403);
    }

    public function test_storekeeper_can_manage_inventory_but_forbidden_from_finance_transactions(): void
    {
        // 1. Thủ kho được phép xem danh mục vật tư
        $response = $this->actingAs($this->storekeeper, 'sanctum')
            ->getJson('/api/v1/materials');
        $response->assertStatus(200);

        // 2. Thủ kho bị cấm truy cập sổ quỹ tiền mặt (403 Forbidden)
        $financeView = $this->actingAs($this->storekeeper, 'sanctum')
            ->getJson('/api/v1/cash-transactions');
        $financeView->assertStatus(403);

        // 3. Thủ kho bị cấm lập phiếu thu/chi tài chính (403 Forbidden)
        $financeCreate = $this->actingAs($this->storekeeper, 'sanctum')
            ->postJson('/api/v1/cash-transactions', [
                'transaction_type' => 'EXPENSE',
                'amount' => 1000000,
                'transaction_date' => '2026-10-20',
                'category' => 'Chi phí kho',
                'description' => 'Mua pallet',
                'payer_payee' => 'Công ty Mộc Phát',
            ]);
        $financeCreate->assertStatus(403);
    }

    public function test_evaluator_can_view_ocop_applications_but_forbidden_from_modifying_or_finance(): void
    {
        // 1. Giám khảo OCOP được phép xem hồ sơ dự thi
        $response = $this->actingAs($this->evaluator, 'sanctum')
            ->getJson('/api/v1/ocop/applications');
        $response->assertStatus(200);

        // 2. Giám khảo bị cấm tạo giao dịch tài chính (403 Forbidden)
        $financeCreate = $this->actingAs($this->evaluator, 'sanctum')
            ->postJson('/api/v1/cash-transactions', [
                'transaction_type' => 'INCOME',
                'amount' => 1000000,
                'transaction_date' => '2026-10-20',
                'category' => 'Lệ phí chấm điểm',
                'description' => 'Thu lệ phí',
                'payer_payee' => 'HTX Phú Thịnh',
            ]);
        $financeCreate->assertStatus(403);

        // 3. Giám khảo bị cấm quản trị người dùng (403 Forbidden)
        $userList = $this->actingAs($this->evaluator, 'sanctum')
            ->getJson('/api/v1/users');
        $userList->assertStatus(403);
    }

    public function test_ocop_preparer_is_forbidden_from_evaluator_scoring_due_to_sod(): void
    {
        // 1. Chuyên viên nộp hồ sơ được phép xem hồ sơ OCOP của HTX
        $response = $this->actingAs($this->ocopPreparer, 'sanctum')
            ->getJson('/api/v1/ocop/applications');
        $response->assertStatus(200);

        // 2. SoD Invariant: Chuyên viên hồ sơ OCOP cấm không được chấm điểm đánh giá
        $fakeSessionId = (string) Str::uuid();
        $scoreResponse = $this->actingAs($this->ocopPreparer, 'sanctum')
            ->postJson("/api/v1/ocop/evaluation-sessions/{$fakeSessionId}/scores", [
                'indicator_id' => (string) Str::uuid(),
                'score' => 5.0,
                'notes' => 'Tự chấm điểm gian lận',
            ]);
        $scoreResponse->assertStatus(403);
    }

    public function test_system_admin_has_technical_privileges_but_cannot_auto_approve_business_decisions(): void
    {
        // 1. System Admin có quyền quản trị người dùng
        $usersResponse = $this->actingAs($this->sysAdmin, 'sanctum')
            ->getJson('/api/v1/users');
        $usersResponse->assertStatus(200);

        // 2. System Admin có quyền xem và cấu hình danh sách vai trò
        $rolesResponse = $this->actingAs($this->sysAdmin, 'sanctum')
            ->getJson('/api/v1/roles');
        $rolesResponse->assertStatus(200);

        // 3. SoD Invariant: System Admin KHÔNG ĐƯỢC tự động phê duyệt quyết định phân hạng OCOP
        $fakeAppId = (string) Str::uuid();
        $decisionApproveResponse = $this->actingAs($this->sysAdmin, 'sanctum')
            ->postJson("/api/v1/ocop/applications/{$fakeAppId}/approve", [
                'decision_number' => 'QD-9999/UBND',
                'signed_by' => 'Admin Test',
                'decision_date' => '2026-10-20',
                'recognized_star' => 4,
            ]);
        $decisionApproveResponse->assertStatus(403);
    }

    public function test_htx_owner_can_manage_members_and_finance(): void
    {
        // 1. Chủ tịch HTX xem danh sách thành viên
        $membersResponse = $this->actingAs($this->htxOwner, 'sanctum')
            ->getJson('/api/v1/members');
        $membersResponse->assertStatus(200);

        // 2. Chủ tịch HTX xem danh sách giao dịch tài chính
        $financeResponse = $this->actingAs($this->htxOwner, 'sanctum')
            ->getJson('/api/v1/cash-transactions');
        $financeResponse->assertStatus(200);
    }
}
