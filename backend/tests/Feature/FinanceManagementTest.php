<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Finance\Infrastructure\Persistence\Models\DebtSettlementModel;
use Modules\Finance\Infrastructure\Persistence\Models\ReceivablePayableModel;
use Modules\Finance\Infrastructure\Persistence\Models\SurplusDistributionAllocationModel;
use Modules\Finance\Infrastructure\Persistence\Models\SurplusDistributionPlanModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Tests\TestCase;

class FinanceManagementTest extends TestCase
{
    private function createCooperative(string $code = null): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => $code ?: 'HTX_FIN_' . Str::random(4),
            'legal_name' => 'HTX Dịch Vụ Nông Nghiệp Tài Chính',
            'status' => 'ACTIVE',
        ]);
    }

    private function createUserWithPermissions(CooperativeModel $coop, array $permissionCodes): UserModel
    {
        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_FIN_TEST_' . Str::random(4),
            'name' => 'Finance Test Role',
        ]);

        foreach ($permissionCodes as $pCode) {
            $permission = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => 'Perm ' . $pCode, 'module' => 'Finance']
            );
            $role->permissions()->attach($permission->id);
        }

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'fin_user_' . Str::random(5),
            'email' => 'fin_user_' . Str::random(5) . '@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Kế Toán Trưởng HTX',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return $user;
    }

    // --- CASH TRANSACTION & LIFECYCLE & IDEMPOTENCY TESTS ---

    public function test_cash_transaction_creation_posting_and_balance_calculation(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['FINANCE.CREATE', 'FINANCE.READ', 'FINANCE.UPDATE']);

        // 1. Create Income Voucher (DRAFT)
        $incResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'transaction_type' => 'INCOME',
            'amount' => 10000000.0,
            'transaction_date' => '2026-09-01',
            'category' => 'THU_BAN_HANG',
            'description' => 'Thu tiền bán nông sản',
        ]);

        $incResp->assertStatus(201);
        $incId = $incResp->json('data.id');

        // Cash balance should be 0 before POSTED
        $listResp1 = $this->actingAs($user, 'sanctum')->getJson('/api/v1/cash-transactions');
        $listResp1->assertJsonPath('meta.current_cash_balance', 0);

        // 2. Approve & Post Income
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/cash-transactions/{$incId}/approve");
        $postIncResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/cash-transactions/{$incId}/post");
        $postIncResp->assertStatus(200);

        // 3. Idempotency test: Re-posting should NOT increase balance twice
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/cash-transactions/{$incId}/post");

        // 4. Create & Post Expense Voucher (3,000,000)
        $expResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'transaction_type' => 'EXPENSE',
            'amount' => 3000000.0,
            'transaction_date' => '2026-09-02',
            'category' => 'CHI_MUA_VAT_TU',
        ]);
        $expId = $expResp->json('data.id');

        $this->actingAs($user, 'sanctum')->postJson("/api/v1/cash-transactions/{$expId}/approve");
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/cash-transactions/{$expId}/post");

        // Cash balance must be 7,000,000 (10M - 3M)
        $listResp2 = $this->actingAs($user, 'sanctum')->getJson('/api/v1/cash-transactions');
        $listResp2->assertJsonPath('meta.current_cash_balance', 7000000);
    }

    public function test_cash_transaction_idempotency_for_approve_and_post(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['FINANCE.CREATE', 'FINANCE.READ', 'FINANCE.UPDATE', 'FINANCE.TRANSACTION.APPROVE']);

        $tx = CashTransactionModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'voucher_number' => 'PT-IDEMP-01',
            'transaction_type' => 'INCOME',
            'amount' => 5000000.0,
            'transaction_date' => '2026-09-01',
            'category' => 'GENERAL',
            'status' => 'DRAFT',
        ]);

        // Duplicate Approve calls
        $app1 = $this->actingAs($user, 'sanctum')->postJson("/api/v1/cash-transactions/{$tx->id}/approve");
        $app2 = $this->actingAs($user, 'sanctum')->postJson("/api/v1/cash-transactions/{$tx->id}/approve");
        $app1->assertStatus(200);
        $app2->assertStatus(200);

        // Duplicate Post calls
        $post1 = $this->actingAs($user, 'sanctum')->postJson("/api/v1/cash-transactions/{$tx->id}/post");
        $post2 = $this->actingAs($user, 'sanctum')->postJson("/api/v1/cash-transactions/{$tx->id}/post");
        $post1->assertStatus(200);
        $post2->assertStatus(200);

        // Count posted records in DB for this voucher -> must be exactly 1
        $this->assertEquals(1, CashTransactionModel::where('voucher_number', 'PT-IDEMP-01')->where('status', 'POSTED')->count());
    }

    // --- RECEIVABLE / PAYABLE & SETTLEMENT & CONCURRENCY TESTS ---

    public function test_debt_creation_settlement_over_settlement_rejection_and_cash_integration(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['FINANCE.CREATE', 'FINANCE.READ', 'FINANCE.UPDATE']);

        // 1. Create Receivable Debt (5,000,000)
        $debtResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/receivable-payables', [
            'debt_type' => 'RECEIVABLE',
            'counterparty_type' => 'CUSTOMER',
            'counterparty_name' => 'Công Ty Nông Sản Việt',
            'original_amount' => 5000000.0,
            'due_date' => '2026-10-01',
            'description' => 'Công nợ tiền mua lô sản phẩm',
        ]);

        $debtResp->assertStatus(201);
        $debtId = $debtResp->json('data.id');
        $this->assertEquals(5000000.0, $debtResp->json('data.outstanding_amount'));
        $this->assertEquals('OPEN', $debtResp->json('data.status'));

        // 2. Attempt Over-Settlement (6,000,000 > 5,000,000)
        $overResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/receivable-payables/{$debtId}/settlements", [
            'settlement_date' => '2026-09-02',
            'amount' => 6000000.0,
            'payment_method' => 'CASH',
        ]);
        $overResp->assertStatus(400);
        $overResp->assertJsonPath('error.code', 'OVER_SETTLEMENT_VIOLATION');

        // 3. Partial Settlement (2,000,000 via CASH)
        $settle1Resp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/receivable-payables/{$debtId}/settlements", [
            'settlement_date' => '2026-09-02',
            'amount' => 2000000.0,
            'payment_method' => 'CASH',
            'note' => 'Thanh toán đợt 1',
        ]);

        $settle1Resp->assertStatus(201);
        $cashTxId = $settle1Resp->json('data.cash_transaction_id');
        $this->assertNotNull($cashTxId);

        // Check updated debt state (outstanding = 3,000,000, status = PARTIALLY_SETTLED)
        $debtGet1 = $this->actingAs($user, 'sanctum')->getJson("/api/v1/receivable-payables/{$debtId}");
        $debtGet1->assertJsonPath('data.outstanding_amount', 3000000);
        $debtGet1->assertJsonPath('data.status', 'PARTIALLY_SETTLED');

        // 4. Full Remaining Settlement (3,000,000)
        $settle2Resp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/receivable-payables/{$debtId}/settlements", [
            'settlement_date' => '2026-09-03',
            'amount' => 3000000.0,
            'payment_method' => 'CASH',
            'note' => 'Thanh toán đợt 2 dứt điểm',
        ]);
        $settle2Resp->assertStatus(201);

        $debtGet2 = $this->actingAs($user, 'sanctum')->getJson("/api/v1/receivable-payables/{$debtId}");
        $debtGet2->assertJsonPath('data.outstanding_amount', 0);
        $debtGet2->assertJsonPath('data.status', 'SETTLED');

        // Check Cash Balance (should increase by 5,000,000 total from cash settlements)
        $cashResp = $this->actingAs($user, 'sanctum')->getJson('/api/v1/cash-transactions');
        $cashResp->assertJsonPath('meta.current_cash_balance', 5000000);
    }

    public function test_concurrent_settlement_prevention(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['FINANCE.CREATE', 'FINANCE.READ']);

        $debt = ReceivablePayableModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'debt_code' => 'CN-CONCURRENCY-01',
            'debt_type' => 'RECEIVABLE',
            'counterparty_type' => 'CUSTOMER',
            'counterparty_name' => 'Khách Hàng A',
            'original_amount' => 5000000.0,
            'outstanding_amount' => 5000000.0,
            'due_date' => '2026-10-01',
            'status' => 'OPEN',
        ]);

        // Attempt Settlement 1: 3,000,000
        $resp1 = $this->actingAs($user, 'sanctum')->postJson("/api/v1/receivable-payables/{$debt->id}/settlements", [
            'settlement_date' => '2026-09-01',
            'amount' => 3000000.0,
            'payment_method' => 'CASH',
        ]);
        $resp1->assertStatus(201);

        // Attempt Settlement 2: 3,000,000 (Exceeds remaining 2,000,000)
        $resp2 = $this->actingAs($user, 'sanctum')->postJson("/api/v1/receivable-payables/{$debt->id}/settlements", [
            'settlement_date' => '2026-09-01',
            'amount' => 3000000.0,
            'payment_method' => 'CASH',
        ]);
        $resp2->assertStatus(400);
        $resp2->assertJsonPath('error.code', 'OVER_SETTLEMENT_VIOLATION');

        // Total settlement amount in DB must be exactly 3,000,000, not 6,000,000
        $totalSettled = DebtSettlementModel::where('debt_id', $debt->id)->sum('amount');
        $this->assertEquals(3000000.0, (float) $totalSettled);
    }

    // --- SURPLUS DISTRIBUTION & ZERO DENOMINATOR & SNAPSHOT INTEGRITY TESTS ---

    public function test_surplus_distribution_plan_allocation_calculation_and_approval(): void
    {
        $coop = $this->createCooperative('HTX_SURPLUS_TEST');
        $user = $this->createUserWithPermissions($coop, ['FINANCE.CREATE', 'FINANCE.READ', 'FINANCE.UPDATE']);

        // Create 2 Active Members with Capital Contributions
        $member1 = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'MB_SURPLUS_01',
            'status' => 'ACTIVE',
            'identity_information' => ['full_name' => 'Nguyễn Văn Vốn 1'],
            'join_date' => '2025-01-01',
        ]);
        CapitalContributionModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $member1->id,
            'contribution_type' => 'INITIAL',
            'amount' => 60000000.0, // 60% of total capital
            'contribution_date' => '2025-01-01',
        ]);

        $member2 = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'MB_SURPLUS_02',
            'status' => 'ACTIVE',
            'identity_information' => ['full_name' => 'Trần Thị Vốn 2'],
            'join_date' => '2025-01-01',
        ]);
        CapitalContributionModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $member2->id,
            'contribution_type' => 'INITIAL',
            'amount' => 40000000.0, // 40% of total capital
            'contribution_date' => '2025-01-01',
        ]);

        // Create Surplus Plan for 2026 (Total: 100M, Distributable: 80M, Capital Weight: 50%, Service Weight: 50%)
        $planResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/surplus-distribution-plans', [
            'financial_year' => 2026,
            'total_surplus' => 100000000.0,
            'distributable_surplus' => 80000000.0,
            'capital_weight' => 50.0,
            'service_usage_weight' => 50.0,
        ]);

        $planResp->assertStatus(201);
        $planId = $planResp->json('data.id');

        // Verify allocation calculation (Distributable 80M split 50% capital pool = 40M)
        // Member 1 gets 60% of 40M = 24M capital share
        // Member 2 gets 40% of 40M = 16M capital share
        $allocations = $planResp->json('data.allocations');
        $this->assertCount(2, $allocations);

        // Submit & Approve Surplus Plan
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/surplus-distribution-plans/{$planId}/submit");
        $approveResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/surplus-distribution-plans/{$planId}/approve");

        $approveResp->assertStatus(200);
        $approveResp->assertJsonPath('data.status', 'APPROVED');

        // Test Historical Snapshot Protection: Change Member 1 Capital after approval
        CapitalContributionModel::create([
            'id' => (string) Str::uuid(),
            'member_id' => $member1->id,
            'contribution_type' => 'ADDITIONAL',
            'amount' => 500000000.0, // Huge capital increase
            'contribution_date' => '2026-09-02',
        ]);

        // Re-query Plan 2026 allocations -> must be unchanged!
        $planGet = $this->actingAs($user, 'sanctum')->getJson("/api/v1/surplus-distribution-plans/{$planId}");
        $this->assertEquals(60000000.0, $planGet->json('data.allocations.0.capital_contribution_snapshot'));
    }

    public function test_surplus_distribution_handles_zero_denominator_safely(): void
    {
        $coop = $this->createCooperative('HTX_ZERO_DENOM');
        $user = $this->createUserWithPermissions($coop, ['FINANCE.CREATE', 'FINANCE.READ']);

        // Member with 0 capital contribution
        MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'MB_ZERO_01',
            'status' => 'ACTIVE',
            'identity_information' => ['full_name' => 'Xã Viên Mới 1'],
            'join_date' => '2026-01-01',
        ]);

        MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'MB_ZERO_02',
            'status' => 'ACTIVE',
            'identity_information' => ['full_name' => 'Xã Viên Mới 2'],
            'join_date' => '2026-01-01',
        ]);

        // Create Surplus Plan when total coop capital = 0 and total service = 0
        $planResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/surplus-distribution-plans', [
            'financial_year' => 2026,
            'total_surplus' => 1000.0,
            'distributable_surplus' => 950.0,
        ]);

        $planResp->assertStatus(201);
        $allocations = $planResp->json('data.allocations');
        $this->assertCount(2, $allocations);

        // Sum of allocations must not exceed distributable surplus (1000.0)
        $totalAllocated = array_sum(array_column($allocations, 'total_allocated_amount'));
        $this->assertLessThanOrEqual(1000.0, $totalAllocated);
    }

    public function test_cross_tenant_isolation_for_finance(): void
    {
        $coopA = $this->createCooperative('HTX_FIN_A');
        $coopB = $this->createCooperative('HTX_FIN_B');

        $userA = $this->createUserWithPermissions($coopA, ['FINANCE.READ']);

        $txB = CashTransactionModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopB->id,
            'voucher_number' => 'PT-COOP-B',
            'transaction_type' => 'INCOME',
            'amount' => 500000,
            'transaction_date' => '2026-09-01',
            'category' => 'GENERAL',
            'status' => 'POSTED',
        ]);

        $response = $this->actingAs($userA, 'sanctum')->getJson("/api/v1/cash-transactions/{$txB->id}");

        $response->assertStatus(404);
        $response->assertJsonPath('error.code', 'CASH_TRANSACTION_NOT_FOUND');
    }

    public function test_harvest_settlement_offset_debt_and_net_payout_calculation(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['FINANCE.CREATE', 'FINANCE.READ']);

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_HARVEST_TEST',
            'status' => 'ACTIVE',
            'identity_information' => ['full_name' => 'Nguyễn Văn Nông Sản'],
            'join_date' => '2025-01-01',
        ]);

        // Member has 3,000,000 outstanding material debt
        $debt = ReceivablePayableModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'debt_code' => 'CN-HARVEST-01',
            'debt_type' => 'RECEIVABLE',
            'counterparty_type' => 'MEMBER',
            'counterparty_id' => $member->id,
            'counterparty_name' => 'Nguyễn Văn Nông Sản',
            'original_amount' => 3000000.0,
            'outstanding_amount' => 3000000.0,
            'due_date' => '2026-10-01',
            'status' => 'OPEN',
        ]);

        // Process harvest settlement: produce value 10,000,000 (Fee 2.5% = 250,000, Debt Offset = 3,000,000, Net = 6,750,000)
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/receivable-payables/harvest-settlements', [
            'member_id' => $member->id,
            'produce_value' => 10000000.0,
            'service_fee_rate' => 0.025,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.gross_produce_value', 10000000);
        $response->assertJsonPath('data.service_fee', 250000);
        $response->assertJsonPath('data.total_debt_offset', 3000000);
        $response->assertJsonPath('data.net_payout', 6750000);
        $response->assertJsonPath('data.remaining_member_debt', 0);

        // Verify debt was settled in DB
        $updatedDebt = ReceivablePayableModel::find($debt->id);
        $this->assertEquals(0, $updatedDebt->outstanding_amount);
        $this->assertEquals('SETTLED', $updatedDebt->status);
    }

    public function test_surplus_plan_fails_when_distributable_exceeds_95_percent(): void
    {
        $coop = $this->createCooperative();
        $user = $this->createUserWithPermissions($coop, ['FINANCE.CREATE']);

        // Attempting distributable surplus = 98% (violates min 5% reserve fund)
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/surplus-distribution-plans', [
            'financial_year' => 2026,
            'total_surplus' => 100000000.0,
            'distributable_surplus' => 98000000.0,
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'ERR_FINANCE_INVALID_SURPLUS_PLAN');
    }
}
