<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialBatchModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockReceiptModel;
use Tests\TestCase;

class InventoryManagementTest extends TestCase
{
    private function createCooperative(?string $code = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'HTX_INV_'.Str::random(4),
            'legal_name' => 'HTX Dịch Vụ Nông Nghiệp Tồn Kho',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop, array $permissionCodes): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_INV_TEST_'.Str::random(4),
            'name' => 'Inventory Test Role',
        ]);

        foreach ($permissionCodes as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm '.$pCode, 'module' => 'Inventory']
            );
            $role->permissions()->attach($permission->id);
        }

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'inv_user_'.Str::random(5),
            'email' => 'inv_user_'.Str::random(5).'@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Thủ Kho HTX',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    // --- MATERIAL TESTS ---

    public function test_create_material_master_data_successfully(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE', 'INVENTORY.READ']);

        $payload = [
            'sku' => 'NPK_PHU_MY_16',
            'name' => 'Phân Bón NPK Phú Mỹ 16-16-8',
            'category' => 'FERTILIZER',
            'unit' => 'KG',
            'safety_information' => ['phi_days' => 7],
            'reorder_threshold' => 100.0,
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/materials', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.sku', 'NPK_PHU_MY_16');
        $response->assertJsonPath('data.available_stock', 0);

        $this->assertDatabaseHas('materials', [
            'cooperative_id' => $coop->id,
            'sku' => 'NPK_PHU_MY_16',
        ]);
    }

    public function test_create_material_fails_on_duplicate_sku(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE']);

        MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'SKU_DUP',
            'name' => 'Vật Tư Cũ',
            'category' => 'FERTILIZER',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/materials', [
            'sku' => 'SKU_DUP',
            'name' => 'Vật Tư Trùng SKU',
            'category' => 'FERTILIZER',
            'unit' => 'KG',
        ]);

        $response->assertStatus(409);
        $response->assertJsonPath('error.code', 'DUPLICATE_MATERIAL_SKU');
    }

    // --- STOCK RECEIPT & POSTING TESTS ---

    public function test_stock_receipt_approval_increases_available_stock_idempotently(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE', 'INVENTORY.READ', 'INVENTORY.UPDATE']);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'MAT_RECEIPT_01',
            'name' => 'Phân Bón Hữu Cơ',
            'category' => 'FERTILIZER',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        // 1. Create Receipt Draft
        $createResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-receipts', [
            'receipt_date' => '2026-09-01',
            'lines' => [
                [
                    'material_id' => $material->id,
                    'quantity' => 100.0,
                    'unit_price' => 15000,
                ],
            ],
        ]);

        $createResponse->assertStatus(201);
        $receiptId = $createResponse->json('data.id');

        // Stock should still be 0 while in DRAFT
        $matResponse = $this->actingAs($user, 'sanctum')->getJson("/api/v1/materials/{$material->id}");
        $matResponse->assertJsonPath('data.available_stock', 0);

        // 2. Submit & Approve Receipt
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-receipts/{$receiptId}/submit");
        $approveResponse = $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-receipts/{$receiptId}/approve");

        $approveResponse->assertStatus(200);
        $approveResponse->assertJsonPath('data.status', 'APPROVED');

        // Stock must increase to 100
        $matResponseAfter = $this->actingAs($user, 'sanctum')->getJson("/api/v1/materials/{$material->id}");
        $matResponseAfter->assertJsonPath('data.available_stock', 100);

        // 3. Idempotency test: Re-approve should NOT double stock
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-receipts/{$receiptId}/approve");
        $matResponseDouble = $this->actingAs($user, 'sanctum')->getJson("/api/v1/materials/{$material->id}");
        $matResponseDouble->assertJsonPath('data.available_stock', 100);
    }

    // --- STOCK ISSUE & SUFFICIENT/INSUFFICIENT STOCK TESTS ---

    public function test_stock_issue_approval_decreases_stock_and_rejects_insufficient_stock(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE', 'INVENTORY.READ', 'INVENTORY.UPDATE']);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'MAT_ISSUE_01',
            'name' => 'Thuốc Trừ Sâu B',
            'category' => 'PESTICIDE',
            'unit' => 'LIT',
            'status' => 'ACTIVE',
        ]);

        // Add 100 LIT via Approved Receipt
        $receipt = StockReceiptModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'receipt_number' => 'PNK_STOCK_100',
            'receipt_date' => '2026-09-01',
            'status' => 'APPROVED',
            'total_amount' => 1000000,
        ]);
        $receipt->lines()->create([
            'id' => (string) Str::uuid(),
            'material_id' => $material->id,
            'quantity' => 100.0,
            'unit_price' => 10000,
            'line_amount' => 1000000,
        ]);

        // Available stock is 100
        $matResp = $this->actingAs($user, 'sanctum')->getJson("/api/v1/materials/{$material->id}");
        $matResp->assertJsonPath('data.available_stock', 100);

        // 1. Attempt Stock Issue of 150 LIT (Insufficient stock!)
        $excessIssueResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-issues', [
            'issue_date' => '2026-09-02',
            'lines' => [
                ['material_id' => $material->id, 'quantity' => 150.0],
            ],
        ]);
        $excessIssueId = $excessIssueResp->json('data.id');

        $excessApproveResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-issues/{$excessIssueId}/approve");
        $excessApproveResp->assertStatus(400);
        $excessApproveResp->assertJsonPath('error.code', 'INSUFFICIENT_STOCK');

        // 2. Stock Issue of 30 LIT (Valid!)
        $validIssueResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-issues', [
            'issue_date' => '2026-09-02',
            'lines' => [
                ['material_id' => $material->id, 'quantity' => 30.0],
            ],
        ]);
        $validIssueId = $validIssueResp->json('data.id');

        $validApproveResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-issues/{$validIssueId}/approve");
        $validApproveResp->assertStatus(200);

        // Remaining available stock must be 70 LIT (100 - 30)
        $matRespFinal = $this->actingAs($user, 'sanctum')->getJson("/api/v1/materials/{$material->id}");
        $matRespFinal->assertJsonPath('data.available_stock', 70);
    }

    // --- FULL INVENTORY LIFECYCLE & STOCK COUNT INTEGRATION TEST ---

    public function test_full_inventory_lifecycle_receipt_issue_and_stock_count(): void
    {
        $coop = $this->createCooperative('HTX_FULL_LIFECYCLE');
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE', 'INVENTORY.READ', 'INVENTORY.UPDATE']);

        // 1. Create Material Master
        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'MAT_LIFECYCLE_01',
            'name' => 'Vật Tư Tổng Hợp',
            'category' => 'GENERAL',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        // 2. Receipt +100 KG
        $rcp = StockReceiptModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'receipt_number' => 'PNK_LIFE_100',
            'receipt_date' => '2026-09-01',
            'status' => 'APPROVED',
        ]);
        $rcp->lines()->create([
            'id' => (string) Str::uuid(),
            'material_id' => $material->id,
            'quantity' => 100.0,
            'unit_price' => 1000,
            'line_amount' => 100000,
        ]);

        // 3. Issue -30 KG
        $iss = StockIssueModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'issue_number' => 'PXK_LIFE_30',
            'issue_date' => '2026-09-02',
            'status' => 'APPROVED',
        ]);
        $iss->lines()->create([
            'id' => (string) Str::uuid(),
            'material_id' => $material->id,
            'quantity' => 30.0,
            'unit_price' => 1000,
            'line_amount' => 30000,
        ]);

        // Current Stock = 70 KG. Create Stock Count with counted actual = 68 KG (-2 KG difference)
        $countResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-counts', [
            'count_date' => '2026-09-03',
            'lines' => [
                [
                    'material_id' => $material->id,
                    'actual_quantity' => 68.0,
                    'reason' => 'Hao hụt tự nhiên 2kg',
                ],
            ],
        ]);

        $countResponse->assertStatus(201);
        $countResponse->assertJsonPath('data.lines.0.expected_quantity', 70);
        $countResponse->assertJsonPath('data.lines.0.actual_quantity', 68);
        $countResponse->assertJsonPath('data.lines.0.difference', -2);

        $countId = $countResponse->json('data.id');

        // Complete & Approve Stock Count
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-counts/{$countId}/complete");
        $approveCountResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-counts/{$countId}/approve");
        $approveCountResp->assertStatus(200);
        $approveCountResp->assertJsonPath('data.status', 'APPROVED');
    }

    public function test_cross_tenant_isolation_prevents_accessing_other_cooperative_materials_and_receipts(): void
    {
        $coopA = $this->createCooperative('HTX_INV_A');
        $coopB = $this->createCooperative('HTX_INV_B');

        $userA = $this->createUserWithPermissions($coopA, ['INVENTORY.READ']);

        $matB = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopB->id,
            'sku' => 'MAT_COOP_B',
            'name' => 'Vật Tư HTX B',
            'category' => 'GENERAL',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($userA, 'sanctum')->getJson("/api/v1/materials/{$matB->id}");

        $response->assertStatus(404);
        $response->assertJsonPath('error.code', 'MATERIAL_NOT_FOUND');
    }

    public function test_prohibited_substance_check_blocks_material_creation(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/materials', [
            'sku' => 'BANNED_01',
            'name' => 'Thuốc Trừ Sâu Chứa Paraquat',
            'category' => 'PESTICIDE',
            'unit' => 'LIT',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'ERR_SUPPLY_PROHIBITED_SUBSTANCE');
    }

    public function test_fefo_stock_issue_and_batch_creation(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE', 'INVENTORY.READ', 'INVENTORY.UPDATE']);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'FEFO_MAT_01',
            'name' => 'Hạt Giống Sweet Palermo F1',
            'category' => 'SEED',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        // Create approved receipt (creates batch)
        $receipt = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-receipts', [
            'receipt_date' => '2026-09-01',
            'lines' => [
                [
                    'material_id' => $material->id,
                    'quantity' => 50.0,
                    'unit_price' => 200000,
                    'batch_code' => 'LOT-PALERMO-2026A',
                    'expiry_date' => '2027-12-31',
                ],
            ],
        ]);
        $receiptId = $receipt->json('data.id');
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-receipts/{$receiptId}/approve");

        // Verify batch was created
        $this->assertDatabaseHas('material_batches', [
            'material_id' => $material->id,
            'batch_number' => 'LOT-PALERMO-2026A',
            'quantity' => 50.0,
        ]);
    }

    public function test_credit_advance_issue_blocks_when_member_credit_limit_exceeded(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE', 'INVENTORY.READ', 'INVENTORY.UPDATE']);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_CREDIT_TEST',
            'identity_information' => ['full_name' => 'Xã Viên Thử Hạn Mức'],
            'member_type' => 'OFFICIAL',
            'credit_limit' => 10000000, // 10 triệu
            'status' => 'ACTIVE',
        ]);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'FERT_CREDIT',
            'name' => 'Phân Bón Trả Chậm',
            'category' => 'FERTILIZER',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        // Add 1000 KG stock
        $rcp = StockReceiptModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'receipt_number' => 'PNK_CREDIT_STOCK',
            'receipt_date' => '2026-09-01',
            'status' => 'APPROVED',
        ]);
        $rcp->lines()->create([
            'id' => (string) Str::uuid(),
            'material_id' => $material->id,
            'quantity' => 1000.0,
            'unit_price' => 50000,
            'line_amount' => 50000000,
        ]);

        // Issue 15 triệu (exceeds 10M credit limit!)
        $issueResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-issues', [
            'issue_date' => '2026-09-02',
            'member_id' => $member->id,
            'is_credit' => true,
            'lines' => [
                ['material_id' => $material->id, 'quantity' => 300.0, 'unit_price' => 50000], // 15 triệu
            ],
        ]);
        $issueId = $issueResp->json('data.id');

        $approveResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-issues/{$issueId}/approve");
        $approveResp->assertStatus(422);
        $approveResp->assertJsonPath('error.code', 'ERR_MEMBER_CREDIT_LIMIT_EXCEEDED');
    }

    public function test_fefo_stock_issue_blocks_expired_batches(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE', 'INVENTORY.READ', 'INVENTORY.UPDATE']);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'EXP_MAT_01',
            'name' => 'Thuốc Sinh Học Cận Hạn',
            'category' => 'PESTICIDE',
            'unit' => 'LIT',
            'status' => 'ACTIVE',
        ]);

        // Create expired batch
        MaterialBatchModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'material_id' => $material->id,
            'batch_number' => 'LOT-EXPIRED-2025',
            'quantity' => 100.0,
            'expired_at' => now()->subDays(10), // Expired 10 days ago!
        ]);

        // Fake approved receipt so availableStock check passes
        $rcp = StockReceiptModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'receipt_number' => 'PNK_EXP_01',
            'receipt_date' => '2025-01-01',
            'status' => 'APPROVED',
        ]);
        $rcp->lines()->create([
            'id' => (string) Str::uuid(),
            'material_id' => $material->id,
            'quantity' => 100.0,
            'unit_price' => 50000,
            'line_amount' => 5000000,
        ]);

        // Attempt to issue
        $issueResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-issues', [
            'issue_date' => '2026-10-31',
            'lines' => [
                ['material_id' => $material->id, 'quantity' => 10.0, 'unit_price' => 50000],
            ],
        ]);
        $issueId = $issueResp->json('data.id');

        $approveResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-issues/{$issueId}/approve");
        $approveResp->assertStatus(400);
        $approveResp->assertJsonPath('error.code', 'MATERIAL_BATCH_EXPIRED');
    }

    public function test_credit_advance_issue_creates_receivable_and_enforces_member_credit_limit(): void
    {
        $coop = $this->createCooperative('HTX_CREDIT_ADVANCE');
        $user = $this->createUserWithPermissions($coop, ['INVENTORY.CREATE', 'INVENTORY.READ', 'INVENTORY.UPDATE']);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_NO_01',
            'identity_information' => ['full_name' => 'Nguyễn Văn Nông Dân'],
            'member_type' => 'OFFICIAL',
            'status' => 'ACTIVE',
            'credit_limit' => 10000000.0, // 10 triệu VNĐ
        ]);

        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'PHAN_HUU_CO_VI_SINH',
            'name' => 'Phân Hữu Cơ Vi Sinh Sông Gianh',
            'category' => 'FERTILIZER',
            'unit' => 'BAO',
            'status' => 'ACTIVE',
        ]);

        // Receipt 100 bao
        $rcp = StockReceiptModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'receipt_number' => 'PNK_HC_100',
            'receipt_date' => '2026-09-01',
            'status' => 'APPROVED',
        ]);
        $rcp->lines()->create([
            'id' => (string) Str::uuid(),
            'material_id' => $material->id,
            'quantity' => 100.0,
            'unit_price' => 200000,
            'line_amount' => 20000000,
        ]);

        // 1. Valid credit advance: 30 bao x 200k = 6.000.000đ (<= 10M limit)
        $issueResp1 = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-issues', [
            'issue_date' => '2026-09-05',
            'member_id' => $member->id,
            'is_credit' => true,
            'purpose' => 'Cấp nợ vật tư đầu vụ',
            'lines' => [
                ['material_id' => $material->id, 'quantity' => 30.0, 'unit_price' => 200000],
            ],
        ]);
        $issueId1 = $issueResp1->json('data.id');

        $approveResp1 = $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-issues/{$issueId1}/approve");
        $approveResp1->assertStatus(200);

        // Assert Receivable record created
        $this->assertDatabaseHas('receivable_payables', [
            'cooperative_id' => $coop->id,
            'member_id' => $member->id,
            'debt_type' => 'RECEIVABLE',
            'original_amount' => 6000000.00,
            'outstanding_amount' => 6000000.00,
            'status' => 'OPEN',
        ]);

        // 2. Excess credit advance: 30 more bao x 200k = 6.000.000đ (Existing 6M + 6M = 12M > 10M limit)
        $issueResp2 = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-issues', [
            'issue_date' => '2026-09-06',
            'member_id' => $member->id,
            'is_credit' => true,
            'purpose' => 'Cấp nợ vượt trần',
            'lines' => [
                ['material_id' => $material->id, 'quantity' => 30.0, 'unit_price' => 200000],
            ],
        ]);
        $issueId2 = $issueResp2->json('data.id');

        $approveResp2 = $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-issues/{$issueId2}/approve");
        $approveResp2->assertStatus(422);
        $approveResp2->assertJsonPath('error.code', 'ERR_MEMBER_CREDIT_LIMIT_EXCEEDED');
    }
}
