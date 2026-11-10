<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Cooperative\Application\Services\CapitalContributionService;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Finance\Application\Services\ReceivablePayableService;
use Modules\Finance\Application\Services\SurplusDistributionService;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Finance\Infrastructure\Persistence\Models\DebtSettlementModel;
use Modules\Finance\Infrastructure\Persistence\Models\ReceivablePayableModel;
use Modules\Finance\Infrastructure\Persistence\Models\SurplusDistributionAllocationModel;
use Modules\Finance\Infrastructure\Persistence\Models\SurplusDistributionPlanModel;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Application\Services\StockIssueService;
use Modules\Inventory\Application\Services\StockReceiptService;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockBalanceModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueItemModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockReceiptItemModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockReceiptModel;
use Modules\Inventory\Infrastructure\Persistence\Models\WarehouseModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evidence\Application\Services\OcopEvidenceAutoExtractionService;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\OcopEvidenceModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

/**
 * KIỂM THỬ TOÀN DIỆN VÒNG TRÒN TÀI CHÍNH HỢP TÁC XÃ (6 CHẶNG KHÉP KÍN)
 *
 * Chặng 1: Huy động Vốn điều lệ & Quản trị Vốn góp, Cấp Hạn mức Tín dụng Xã viên
 * Chặng 2: Cung ứng Vật tư Trả chậm Đầu vụ (Credit Advance) & Ghi nhận Công nợ Phải thu
 * Chặng 3: Sản xuất Canh tác VietGAP, Thu hoạch & Kiểm soát Chất lượng KCS Nông sản
 * Chặng 4: Quyết toán Mùa vụ & Cấn trừ Nợ tự động (Thu phí Dịch vụ & Chi trả Chênh lệch)
 * Chặng 5: Bán hàng Thương mại OCOP, Tích lũy Kết dư & Trích lập Quỹ Pháp định (Luật HTX 2023)
 * Chặng 6: Phân phối Thặng dư Cuối năm, Tái đầu tư Vốn góp & Khép kín Vòng tròn Tài chính
 */
class CooperativeFinancialCircleE2ETest extends TestCase
{
    private function createCooperativeContext(): array
    {
        $coop = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_FIN_CIRCLE_E2E',
            'legal_name' => 'Hợp Tác Xã Nông Nghiệp Công Nghệ Cao E2E',
            'tax_code' => '5801234567',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => 'ROLE_E2E_DIRECTOR',
            'name' => 'Giám đốc Điều hành E2E',
        ]);

        $permissions = [
            'MEMBER.CREATE', 'MEMBER.READ', 'MEMBER.UPDATE',
            'INVENTORY.CREATE', 'INVENTORY.READ', 'INVENTORY.UPDATE',
            'FINANCE.CREATE', 'FINANCE.READ', 'FINANCE.UPDATE',
            'OCOP.READ', 'OCOP.CREATE', 'OCOP.UPDATE',
        ];

        foreach ($permissions as $pCode) {
            $perm = PermissionModel::firstOrCreate(
                ['code' => $pCode],
                ['id' => (string) Str::uuid(), 'name' => $pCode, 'module' => explode('.', $pCode)[0]]
            );
            $role->permissions()->syncWithoutDetaching([$perm->id]);
        }

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'username' => 'director_' . Str::random(5),
            'full_name' => 'Nguyễn Quản Trị',
            'email' => 'director.e2e.' . Str::random(5) . '@htx.vn',
            'password' => bcrypt('Secret123!'),
            'role_id' => $role->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);

        return ['coop' => $coop, 'user' => $user];
    }

    public function test_complete_6_stages_cooperative_financial_circle(): void
    {
        $ctx = $this->createCooperativeContext();
        $coop = $ctx['coop'];
        $user = $ctx['user'];

        // =========================================================================
        // CHẶNG 1: HUY ĐỘNG VỐN ĐIỀU LỆ, GHI SỔ QUỸ, CẤP HẠN MỨC & TRÍCH XUẤT OCOP
        // =========================================================================
        // Tạo 4 thành viên sáng lập khác với 50M vốn góp mỗi người (Tổng 200M) để đảm bảo tuân thủ Điều 74 Luật HTX 2023 (Tối đa 30% vốn điều lệ / thành viên chính thức)
        for ($i = 2; $i <= 5; $i++) {
            $other = MemberModel::create([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coop->id,
                'member_code' => "XV_E2E_00{$i}",
                'status' => 'ACTIVE',
                'identity_information' => ['full_name' => "Xã Viên Sáng Lập {$i}"],
                'member_type' => 'OFFICIAL',
                'join_date' => '2026-01-01',
            ]);
            CapitalContributionModel::create([
                'id' => (string) Str::uuid(),
                'member_id' => $other->id,
                'contribution_type' => 'INITIAL',
                'amount' => 50000000.0,
                'actual_amount' => 50000000.0,
                'committed_amount' => 50000000.0,
                'transaction_date' => '2026-01-02',
                'status' => 'PAID',
            ]);
        }

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'member_code' => 'XV_E2E_001',
            'status' => 'ACTIVE',
            'identity_information' => [
                'full_name' => 'Trần Văn Xã Viên',
                'id_card_number' => '049085001234',
                'phone' => '0988776655',
            ],
            'join_date' => '2026-01-01',
            'credit_limit' => 0.0,
        ]);

        // Xã viên nộp vốn điều lệ 60,000,000 VND bằng Tiền mặt
        $capResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/members/{$member->id}/capital-contributions", [
            'contribution_type' => 'INITIAL',
            'amount' => 60000000.0,
            'actual_amount' => 60000000.0,
            'committed_amount' => 60000000.0,
            'transaction_date' => '2026-01-05',
            'payment_method' => 'TIEN_MAT',
            'value_description' => 'Góp vốn thành lập HTX đợt 1',
        ]);
        $capResp->assertStatus(201);
        $capData = $capResp->json('data');

        // Kiểm tra 1.1: GCN vốn góp được sinh tự động
        $this->assertEquals('PAID', $capData['status']);
        $this->assertNotEmpty($capData['certificate_code']);

        // Kiểm tra 1.2: Phiếu thu tự động ghi vào Sổ quỹ tiền mặt (Cashbook)
        $cashReceipt = CashTransactionModel::where('cooperative_id', $coop->id)
            ->where('member_id', $member->id)
            ->where('transaction_type', 'INCOME')
            ->where('category', 'CAPITAL_CONTRIBUTION')
            ->first();
        $this->assertNotNull($cashReceipt, 'Chặng 1: Phiếu thu tiền mặt góp vốn phải tự động ghi vào Sổ quỹ');
        $this->assertEquals(60000000.0, (float) $cashReceipt->amount);
        $this->assertEquals('POSTED', $cashReceipt->status);

        // Kiểm tra 1.3: Hạn mức tín dụng được kích hoạt tự động theo 50% vốn góp (Trần 50M)
        $memberFresh = MemberModel::find($member->id);
        $this->assertEquals(30000000.0, (float) $memberFresh->credit_limit, 'Chặng 1: Hạn mức tín dụng phải tự động cấp 30,000,000 VND (50% của 60M)');

        // Kiểm tra 1.4: Minh chứng vốn góp OCOP A.1.1/A.1.2 tự động trích xuất
        $product = ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'product_code' => 'SP_PALERMO_E2E',
            'product_name' => 'Ớt Chuông Sweet Palermo E2E',
            'category' => 'FOOD',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);
        $version = CriteriaVersionModel::firstOrCreate(
            ['version_code' => 'QD148_2023'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Quyết định 148/QĐ-TTg',
                'effective_date' => '2023-02-24',
                'status' => 'ACTIVE',
            ]
        );
        $application = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-OCOP-E2E-001',
            'status' => 'DRAFT',
        ]);
        $extractionService = app(OcopEvidenceAutoExtractionService::class);
        $evidence = $extractionService->extractInternalEvidence($application->id, 'CAPITAL_EQUITY', $user->id);
        $this->assertNotNull($evidence, 'Chặng 1: Minh chứng vốn góp OCOP phải được tự động sinh');
        $this->assertEquals('LEGAL_DOCUMENT', $evidence->evidence_type);
        $this->assertEquals('AUTO_EXTRACTED', $evidence->source_type);
        $this->assertStringContainsString('vốn góp', mb_strtolower($evidence->title));

        // =========================================================================
        // CHẶNG 2: CUNG ỨNG VẬT TƯ TRẢ CHẬM ĐẦU VỤ (CREDIT ADVANCE) & PHÁT SINH CÔNG NỢ
        // =========================================================================
        $material = MaterialModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'sku' => 'VT_PHAN_HUU_CO',
            'name' => 'Phân Hữu Cơ Sinh Học OCOP',
            'category' => 'FERTILIZER',
            'unit' => 'BAO',
            'status' => 'ACTIVE',
        ]);

        // Nhập kho vật tư: 200 bao @ 150,000 VND = 30,000,000 VND
        $receipt = StockReceiptModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'receipt_number' => 'PNK-E2E-001',
            'receipt_date' => '2026-02-01',
            'status' => 'APPROVED',
        ]);
        $receipt->lines()->create([
            'id' => (string) Str::uuid(),
            'material_id' => $material->id,
            'quantity' => 200.0,
            'unit_price' => 150000.0,
            'line_amount' => 30000000.0,
        ]);

        // Xuất kho trả chậm cho xã viên: 100 bao @ 200,000 VND = 20,000,000 VND (<= Hạn mức 30,000,000 VND)
        $issueResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-issues', [
            'issue_date' => '2026-02-15',
            'member_id' => $member->id,
            'is_credit' => true,
            'purpose' => 'Cấp nợ vật tư trả chậm đầu vụ',
            'lines' => [
                [
                    'material_id' => $material->id,
                    'quantity' => 100.0,
                    'unit_price' => 200000.0,
                ],
            ],
        ]);
        $issueResp->assertStatus(201);
        $issueId = $issueResp->json('data.id');

        // Phê duyệt xuất kho -> Tự động sinh công nợ
        $approveIssueResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/stock-issues/{$issueId}/approve");
        $approveIssueResp->assertStatus(200);

        // Kiểm tra 2.1: Công nợ phải thu (Receivable) của Xã viên tự động sinh ra
        $this->assertDatabaseHas('receivable_payables', [
            'cooperative_id' => $coop->id,
            'member_id' => $member->id,
            'debt_type' => 'RECEIVABLE',
            'original_amount' => 20000000.0,
            'outstanding_amount' => 20000000.0,
            'status' => 'OPEN',
        ]);
        $memberDebt = ReceivablePayableModel::where('cooperative_id', $coop->id)
            ->where('member_id', $member->id)
            ->where('debt_type', 'RECEIVABLE')
            ->first();
        $this->assertNotNull($memberDebt, 'Chặng 2: Công nợ vật tư trả chậm phải tự động sinh ra');
        $this->assertEquals(20000000.0, (float) $memberDebt->outstanding_amount);
        $this->assertEquals('OPEN', $memberDebt->status);

        // =========================================================================
        // CHẶNG 3: SẢN XUẤT CANH TÁC VIETGAP & THU HOẠCH NÔNG SẢN ĐẠT CHUẨN KCS
        // =========================================================================
        // Mô phỏng thu hoạch đạt chuẩn: 5,000 kg Grade A, 1,000 kg Grade B
        $totalGradeAKg = 5000;
        $totalGradeBKg = 1000;
        $gradeAPrice = 25000.0; // 25,000 VND/kg
        $gradeBPrice = 15000.0; // 15,000 VND/kg

        $grossProduceValue = ($totalGradeAKg * $gradeAPrice) + ($totalGradeBKg * $gradeBPrice);
        $this->assertEquals(140000000.0, $grossProduceValue); // 140,000,000 VND

        // =========================================================================
        // CHẶNG 4: QUYẾT TOÁN MÙA VỤ, CẤN TRỪ NỢ TỰ ĐỘNG & THU PHÍ DỊCH VỤ HTX
        // =========================================================================
        // Giá trị nông sản: 140,000,000 VND
        // Phí dịch vụ HTX: 2.5% = 3,500,000 VND
        // Cấn trừ nợ vật tư: 20,000,000 VND
        // Tiền thực chi trả xã viên: 140,000,000 - 3,500,000 - 20,000,000 = 116,500,000 VND
        $settleResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/receivable-payables/harvest-settlements', [
            'member_id' => $member->id,
            'produce_value' => $grossProduceValue,
            'service_fee_rate' => 0.025,
        ]);
        $settleResp->assertStatus(200);
        $settleData = $settleResp->json('data');

        $this->assertEquals(140000000.0, (float) $settleData['gross_produce_value']);
        $this->assertEquals(3500000.0, (float) $settleData['service_fee']);
        $this->assertEquals(20000000.0, (float) $settleData['total_debt_offset']);
        $this->assertEquals(116500000.0, (float) $settleData['net_payout']);
        $this->assertEquals(0.0, (float) $settleData['remaining_member_debt']);

        // Kiểm tra 4.1: Công nợ vật tư của Xã viên được tất toán dứt điểm (SETTLED)
        $memberDebtUpdated = ReceivablePayableModel::find($memberDebt->id);
        $this->assertEquals(0.0, (float) $memberDebtUpdated->outstanding_amount);
        $this->assertEquals('SETTLED', $memberDebtUpdated->status);

        // Kiểm tra 4.2: Phí dịch vụ 2.5% ghi nhận thành doanh thu dịch vụ HTX vào Sổ quỹ
        $feeIncome = CashTransactionModel::where('cooperative_id', $coop->id)
            ->where('transaction_type', 'INCOME')
            ->where('category', 'FEE_SERVICE')
            ->first();
        $this->assertNotNull($feeIncome, 'Chặng 4: Phí dịch vụ HTX phải được hạch toán vào doanh thu Sổ quỹ');
        $this->assertEquals(3500000.0, (float) $feeIncome->amount);

        // =========================================================================
        // CHẶNG 5: BÁN HÀNG OCOP, TÍCH LŨY KẾT DƯ & QUY CHUẨN QUỸ PHÁP ĐỊNH
        // =========================================================================
        // HTX xuất bán lô sản phẩm Sweet Palermo OCOP cho Siêu thị đối tác: 180,000,000 VND
        CashTransactionModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coop->id,
            'voucher_number' => 'PT-BAN-HANG-001',
            'transaction_type' => 'INCOME',
            'amount' => 180000000.0,
            'transaction_date' => '2026-10-15',
            'category' => 'SALES_REVENUE',
            'description' => 'Thu tiền bán Ớt Chuông Sweet Palermo OCOP cho chuỗi siêu thị',
            'status' => 'POSTED',
        ]);

        // Tổng kết thặng dư sau thuế niên độ: 50,000,000 VND
        // Trích Quỹ chung không chia (10% >= 5% luật định): 5,000,000 VND
        // Thặng dư khả dụng phân chia (90% <= 95%): 45,000,000 VND
        // Tỷ trọng chia: 60% theo dịch vụ (>= 50% theo Luật HTX 2023 Điều 85), 40% theo vốn góp
        $createPlanResp = $this->actingAs($user, 'sanctum')->postJson('/api/v1/surplus-distribution-plans', [
            'financial_year' => 2026,
            'total_surplus' => 50000000.0,
            'distributable_surplus' => 45000000.0,
            'capital_weight' => 40.0,
            'service_usage_weight' => 60.0,
        ]);
        $createPlanResp->assertStatus(201);
        $planId = $createPlanResp->json('data.id');

        // Gửi duyệt & Giám đốc phê duyệt phương án
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/surplus-distribution-plans/{$planId}/submit")->assertStatus(200);
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/surplus-distribution-plans/{$planId}/approve")->assertStatus(200);

        // =========================================================================
        // CHẶNG 6: PHÂN PHỐI THẶNG DƯ, TÁI ĐẦU TƯ KHÉP KÍN & TĂNG HẠN MỨC MÙA VỤ SAU
        // =========================================================================
        // Thực thi phương án: Tái đầu tư thặng dư thành vốn góp bổ sung (reinvest_as_capital = true)
        $executePlanResp = $this->actingAs($user, 'sanctum')->postJson("/api/v1/surplus-distribution-plans/{$planId}/execute", [
            'reinvest_as_capital' => true,
        ]);
        $executePlanResp->assertStatus(200);
        $executePlanResp->assertJsonPath('data.status', 'EXECUTED');

        // Kiểm tra 6.1: Vốn góp bổ sung được tạo tự động với trạng thái PAID và cấp mã GCN
        // Thành viên 1 hưởng: (60M/260M * 18M quỹ vốn) + (20M/20M * 27M quỹ dịch vụ) = 4,153,846.15 + 27,000,000 = 31,153,846.15 VND
        $reinvestedCapital = CapitalContributionModel::where('member_id', $member->id)
            ->where('contribution_type', 'ADDITIONAL')
            ->first();
        $this->assertNotNull($reinvestedCapital, 'Chặng 6: Thặng dư phải tự động chuyển thành vốn góp bổ sung');
        $this->assertEquals(31153846.15, (float) $reinvestedCapital->amount);
        $this->assertEquals('PAID', $reinvestedCapital->status);
        $this->assertNotEmpty($reinvestedCapital->certificate_code);

        // Kiểm tra 6.2: Tổng vốn điều lệ của xã viên tăng từ 60M lên 91.15M (60M + 31.15M)
        $totalCapital = CapitalContributionModel::where('member_id', $member->id)->sum('amount');
        $this->assertEquals(91153846.15, (float) $totalCapital, 'Chặng 6: Tổng vốn góp xã viên phải đạt 91,153,846.15 VND');

        // Kiểm tra 6.3: Hạn mức tín dụng của xã viên cho mùa vụ sau được tăng thêm 50% vốn tái đầu tư (15,576,923.08 VND)
        // Ban đầu 30,000,000 + 15,576,923.08 = 45,576,923.08 VND
        $memberFinal = MemberModel::find($member->id);
        $this->assertEquals(45576923.08, (float) $memberFinal->credit_limit, 'Chặng 6: Hạn mức tín dụng mới được nâng lên 45,576,923.08 VND, khép kín và sẵn sàng ứng vật tư mùa sau!');
    }
}
