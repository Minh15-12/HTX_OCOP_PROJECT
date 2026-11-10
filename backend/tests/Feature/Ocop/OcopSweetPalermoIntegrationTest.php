<?php

namespace Tests\Feature\Ocop;

use Database\Seeders\OcopSweetPalermoCriteriaSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Modules\Report\Infrastructure\Persistence\Models\GeneratedDocumentModel;
use Tests\TestCase;

class OcopSweetPalermoIntegrationTest extends TestCase
{
    private function setupTestEnvironment(): array
    {
        // 1. Seed Sweet Palermo Criteria Version
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);
        $version = CriteriaVersionModel::where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)->first();

        // 2. Create HTX Tân Tiến Cooperative
        $cooperative = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX-TANTIEN-DALAT',
            'legal_name' => 'Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến',
            'display_name' => 'HTX Nông nghiệp Tân Tiến',
            'legal_information' => [
                'representative_name' => 'Nguyễn Văn Tân',
                'representative_title' => 'Giám đốc Hợp tác xã',
                'license_no' => '5801234567 do UBND Thành phố Đà Lạt cấp ngày 10/10/2018',
            ],
            'contact_information' => [
                'address' => 'Tổ Hòn Bồ, Phường 12, Thành phố Đà Lạt, Tỉnh Lâm Đồng',
                'phone' => '0987 654 321',
                'email' => 'htx@tantien.vn',
                'website' => 'https://htxtantien.vn',
            ],
            'status' => 'ACTIVE',
        ]);

        // 3. Create Product: Ớt chuông Sweet Palermo Đỏ Đà Lạt
        $product = ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperative->id,
            'product_code' => 'SP-PALERMO-RED-01',
            'product_name' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'category' => 'FOOD',
            'brand' => 'Rau Đà Lạt',
            'specification' => [
                'brix' => 8.5,
                'weight_per_fruit' => '100 - 150g',
                'length' => '20 - 25cm',
                'color' => 'Đỏ tươi tự nhiên',
                'packaging' => 'Khay giấy ép 500g, màng bọc sinh học tự hủy',
            ],
            'quality_information' => [
                'vietgap' => [
                    'cert_number' => 'VICB-2024-GAP-0128',
                    'valid_until' => '2027-01-14',
                    'certifying_body' => 'VICB',
                ],
                'trademark' => 'Nhãn hiệu chứng nhận Rau Đà Lạt',
            ],
            'status' => 'ACTIVE',
        ]);

        // 4. Create User and Role
        $role = RoleModel::firstOrCreate(
            ['name' => 'HTX_OWNER'],
            ['id' => (string) Str::uuid(), 'code' => 'HTX_OWNER', 'display_name' => 'Chủ nhiệm HTX', 'description' => 'Quản trị HTX']
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'tantien_'.Str::random(4),
            'email' => 'tan_'.Str::random(4).'@tantien.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Nguyễn Văn Tân',
            'cooperative_id' => $cooperative->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);
        $token = $user->createToken('test_auth_token')->plainTextToken;

        // 5. Create Ocop Application
        $application = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperative->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-OCOP-2026-PLM01',
            'application_type' => 'NEW',
            'status' => 'DRAFT',
        ]);

        return [
            'version' => $version,
            'cooperative' => $cooperative,
            'product' => $product,
            'user' => $user,
            'application' => $application,
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ],
        ];
    }

    public function test_seeder_executes_and_creates_published_criteria_with_100_points(): void
    {
        $this->seed(OcopSweetPalermoCriteriaSeeder::class);

        $version = CriteriaVersionModel::with('groups.criteria.indicators', 'scoringRules', 'mandatoryConditions')
            ->where('version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE)
            ->first();

        // 1. Version assertions
        $this->assertNotNull($version);
        $this->assertEquals('PUBLISHED', $version->status);
        $this->assertEquals(OcopSweetPalermoCriteriaSeeder::VERSION_CODE, $version->version_code);
        $this->assertStringContainsString('Rau, củ, quả tươi', $version->name);

        // 2. Groups assertions: Exactly 3 groups
        $this->assertCount(3, $version->groups);
        $groupA = $version->groups->firstWhere('code', 'GA');
        $groupB = $version->groups->firstWhere('code', 'GB');
        $groupC = $version->groups->firstWhere('code', 'GC');

        $this->assertNotNull($groupA);
        $this->assertNotNull($groupB);
        $this->assertNotNull($groupC);

        // Sum max_score per group
        $scoreA = $groupA->criteria->sum(fn ($c) => $c->indicators->sum('max_score'));
        $scoreB = $groupB->criteria->sum(fn ($c) => $c->indicators->sum('max_score'));
        $scoreC = $groupC->criteria->sum(fn ($c) => $c->indicators->sum('max_score'));

        $this->assertEquals(40.0, $scoreA, 'Phần A phải có đúng 40.0 điểm');
        $this->assertEquals(25.0, $scoreB, 'Phần B phải có đúng 25.0 điểm');
        $this->assertEquals(35.0, $scoreC, 'Phần C phải có đúng 35.0 điểm');

        // Total score = 100.0
        $totalIndicatorsScore = $scoreA + $scoreB + $scoreC;
        $this->assertEquals(100.0, $totalIndicatorsScore, 'Tổng điểm cây tiêu chí phải bằng đúng 100.0 điểm');

        // 3. Exactly 11 indicators
        $allIndicators = $version->groups->flatMap(fn ($g) => $g->criteria->flatMap->indicators);
        $this->assertCount(11, $allIndicators, 'Phải có chính xác 11 chỉ tiêu đánh giá');

        // Check required codes
        $expectedCodes = [
            'TC-A.1.1', 'TC-A.2.1', 'TC-A.3.1', 'TC-A.4.1',
            'TC-B.1.1', 'TC-B.1.2', 'TC-B.2.1',
            'TC-C.1.1', 'TC-C.2.1', 'TC-C.2.2', 'TC-C.3.1',
        ];
        foreach ($expectedCodes as $code) {
            $this->assertTrue($allIndicators->contains('code', $code), "Thiếu chỉ tiêu: {$code}");
        }

        // 4. Scoring rules assertions: 11 rules with steps
        $this->assertCount(11, $version->scoringRules);
        foreach ($version->scoringRules as $rule) {
            $this->assertEquals('ACTIVE', $rule->status);
            $this->assertIsArray($rule->configuration);
            $this->assertNotEmpty($rule->configuration['steps'], "Quy tắc {$rule->rule_code} phải có các bước bậc thang điểm");
        }

        // 5. Mandatory conditions assertions: 6 conditions
        $this->assertCount(6, $version->mandatoryConditions);
        $conditionCodes = $version->mandatoryConditions->pluck('condition_code')->toArray();
        $this->assertContains('COND-VIETGAP-MANDATORY', $conditionCodes);
        $this->assertContains('COND-ENVIRONMENT-MANDATORY', $conditionCodes);
        $this->assertContains('COND-RAW-MATERIAL-MINIMUM', $conditionCodes);
        $this->assertContains('COND-PACKAGING-QR-MANDATORY', $conditionCodes);
        $this->assertContains('COND-FOOD-SAFETY-PHI', $conditionCodes);
        $this->assertContains('COND-COMPLETENESS-100', $conditionCodes);
    }

    public function test_score_suggestions_api_returns_rationales_and_predicted_stars(): void
    {
        $ctx = $this->setupTestEnvironment();

        $response = $this->withHeaders($ctx['headers'])
            ->getJson("/api/v1/ocop/applications/{$ctx['application']->id}/score-suggestions");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.application_id', $ctx['application']->id);
        $response->assertJsonPath('data.criteria_version_code', OcopSweetPalermoCriteriaSeeder::VERSION_CODE);
        $response->assertJsonPath('data.predicted_star', '4_STAR');

        $suggestions = $response->json('data.suggestions');
        $this->assertIsArray($suggestions);
        $this->assertCount(11, $suggestions, 'Phải có gợi ý cho 11 chỉ tiêu');

        // Test specific indicators with HTX Tân Tiến evidence
        // TC-A.1.1
        $this->assertEquals(10.0, $suggestions['TC-A.1.1']['suggested_score']);
        $this->assertStringContainsString('Đà Lạt', $suggestions['TC-A.1.1']['reason']);
        $this->assertEquals('FARM_PLOT', $suggestions['TC-A.1.1']['auto_evidence_type']);

        // TC-A.2.1
        $this->assertEquals(5.0, $suggestions['TC-A.2.1']['suggested_score']);
        $this->assertStringContainsString('165', $suggestions['TC-A.2.1']['reason']);
        $this->assertEquals('MEMBER_LIST', $suggestions['TC-A.2.1']['auto_evidence_type']);

        // TC-A.3.1
        $this->assertEquals(10.0, $suggestions['TC-A.3.1']['suggested_score']);
        $this->assertStringContainsString('4.720', $suggestions['TC-A.3.1']['reason']);
        $this->assertEquals('SUPPLY_CONTRACT', $suggestions['TC-A.3.1']['auto_evidence_type']);

        // TC-C.2.1
        $this->assertEquals(10.0, $suggestions['TC-C.2.1']['suggested_score']);
        $this->assertStringContainsString('VICB-2024-GAP-0128', $suggestions['TC-C.2.1']['reason']);
        $this->assertEquals('VIETGAP_CERTIFICATE', $suggestions['TC-C.2.1']['auto_evidence_type']);

        // TC-C.2.2
        $this->assertEquals(5.0, $suggestions['TC-C.2.2']['suggested_score']);
        $this->assertStringContainsString('PHI', $suggestions['TC-C.2.2']['reason']);
        $this->assertEquals('PHI_LOG', $suggestions['TC-C.2.2']['auto_evidence_type']);

        // Mandatory conditions evaluation
        $mandatoryEval = $response->json('data.mandatory_conditions_evaluation');
        $this->assertTrue($mandatoryEval['all_conditions_satisfied']);
        $this->assertTrue($mandatoryEval['vietgap_valid_for_4_star']['satisfied']);
        $this->assertTrue($mandatoryEval['environmental_commitment_for_submit']['satisfied']);
    }

    public function test_form_01_form_02_form_03_generation_produces_valid_html_with_htx_data(): void
    {
        Storage::fake('local');
        $ctx = $this->setupTestEnvironment();
        $appId = $ctx['application']->id;

        // 1. Test Previews
        // Form 01 Preview
        $f1Resp = $this->withHeaders($ctx['headers'])
            ->getJson("/api/v1/documents/preview/form-01/{$appId}");
        $f1Resp->assertStatus(200);
        $html01 = $f1Resp->json('data.html');
        $this->assertStringContainsString('PHIẾU ĐĂNG KÝ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP', $html01);
        $this->assertStringContainsString('Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến', $html01);
        $this->assertStringContainsString('Ớt chuông Sweet Palermo Đỏ Đà Lạt', $html01);
        $this->assertStringContainsString('Nguyễn Văn Tân', $html01);
        $this->assertStringContainsString('4 Sao OCOP', $html01);

        // Form 02 Preview
        $f2Resp = $this->withHeaders($ctx['headers'])
            ->getJson("/api/v1/documents/preview/form-02/{$appId}");
        $f2Resp->assertStatus(200);
        $html02 = $f2Resp->json('data.html');
        $this->assertStringContainsString('BÁO CÁO TỰ ĐÁNH GIÁ VỀ SẢN PHẨM OCOP', $html02);
        $this->assertStringContainsString('Phần I: THÔNG TIN CHUNG', $html02);
        $this->assertStringContainsString('Phần II: KẾT QUẢ THỰC HIỆN', $html02);
        $this->assertStringContainsString('Phần III: KẾT QUẢ TỰ ĐÁNH GIÁ', $html02);
        $this->assertStringContainsString('Phần IV: KẾ HOẠCH PHÁT TRIỂN', $html02);
        $this->assertStringContainsString('BẢNG PHỤ LỤC DANH MỤC 14 TÀI LIỆU MINH CHỨNG', $html02);
        $this->assertStringContainsString('MC01', $html02);
        $this->assertStringContainsString('MC14', $html02);
        $this->assertStringContainsString('280 ha', $html02);

        // Form 03 Preview
        $f3Resp = $this->withHeaders($ctx['headers'])
            ->getJson("/api/v1/documents/preview/form-03/{$appId}");
        $f3Resp->assertStatus(200);
        $html03 = $f3Resp->json('data.html');
        $this->assertStringContainsString('BÁO CÁO ĐÁNH GIÁ CỦA ỦY BAN NHÂN DÂN CẤP XÃ', $html03);
        $this->assertStringContainsString('UBND PHƯỜNG 12', $html03);
        $this->assertStringContainsString('1. Về nguồn nguyên liệu địa phương', $html03);
        $this->assertStringContainsString('2. Về sử dụng lao động tại chỗ', $html03);
        $this->assertStringContainsString('3. Về nguồn gốc ý tưởng sản phẩm', $html03);
        $this->assertStringContainsString('4. Về bản sắc và trí tuệ địa phương', $html03);
        $this->assertStringContainsString('4 SAO OCOP', $html03);

        // 2. Test Document Generation & SHA-256 Storage Integrity
        $gen01 = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/documents/generate/form-01/{$appId}");
        $gen01->assertStatus(201);
        $docId01 = $gen01->json('data.id');
        $checksum01 = $gen01->json('data.checksum');
        $this->assertEquals(64, strlen($checksum01));

        $doc01Model = GeneratedDocumentModel::find($docId01);
        $this->assertNotNull($doc01Model);
        $this->assertTrue(Storage::disk('local')->exists($doc01Model->file_reference));
        $fileBytes01 = Storage::disk('local')->get($doc01Model->file_reference);
        $this->assertEquals($checksum01, hash('sha256', $fileBytes01));

        // Generate Form 02
        $gen02 = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/documents/generate/form-02/{$appId}");
        $gen02->assertStatus(201);
        $docId02 = $gen02->json('data.id');
        $checksum02 = $gen02->json('data.checksum');
        $this->assertEquals(64, strlen($checksum02));

        // Generate Form 03
        $gen03 = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/documents/generate/form-03/{$appId}");
        $gen03->assertStatus(201);
        $docId03 = $gen03->json('data.id');
        $checksum03 = $gen03->json('data.checksum');
        $this->assertEquals(64, strlen($checksum03));
    }

    public function test_evidence_auto_extraction_sha256_integrity_and_versioning(): void
    {
        Storage::fake('local');
        $ctx = $this->setupTestEnvironment();
        $appId = $ctx['application']->id;

        // 1. Single extraction: FARM_PLOT
        $response = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/extract-evidence", [
                'extraction_type' => 'FARM_PLOT',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $evidenceId = $response->json('data.id');
        $checksum = $response->json('data.current_version.checksum');
        $versionNum = $response->json('data.current_version.version_number');

        $this->assertEquals(1, $versionNum);
        $this->assertEquals(64, strlen($checksum));

        // Verify SHA-256 integrity on storage disk
        $evidence = EvidenceModel::with('currentVersion', 'indicators')->find($evidenceId);
        $this->assertNotNull($evidence);
        $this->assertEquals('AUTO_EXTRACTED', $evidence->source_type);
        $this->assertTrue(Storage::disk('local')->exists($evidence->currentVersion->file_reference));

        $storedBytes = Storage::disk('local')->get($evidence->currentVersion->file_reference);
        $this->assertEquals($checksum, hash('sha256', $storedBytes));

        // Verify auto-linked to indicator TC-A.1.1
        $this->assertTrue($evidence->indicators->contains('code', 'TC-A.1.1'));

        // 2. Re-extract to test non-destructive versioning (v1 -> v2)
        $reExtractResp = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/extract-evidence", [
                'extraction_type' => 'FARM_PLOT',
            ]);

        $reExtractResp->assertStatus(201);
        $newVersionNum = $reExtractResp->json('data.current_version.version_number');
        $this->assertEquals(2, $newVersionNum, 'Phiên bản mới phải tự động tăng lên v2');

        $evidenceReloaded = EvidenceModel::with('versions')->find($evidenceId);
        $this->assertCount(2, $evidenceReloaded->versions, 'Cả hai phiên bản v1 và v2 phải được bảo toàn');
        $this->assertNotNull($evidenceReloaded->versions->firstWhere('version_number', 2)->replacement_reason);

        // 3. Batch extraction: ALL
        $batchResp = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/extract-evidence", [
                'extraction_type' => 'ALL',
            ]);

        $batchResp->assertStatus(201);
        $this->assertNotNull($batchResp->json('data.farm_plot'));
        $this->assertNotNull($batchResp->json('data.member_list'));
        $this->assertNotNull($batchResp->json('data.phi_journal'));

        // Verify that member_list and phi_journal are linked to their respective indicators
        $memberEvid = EvidenceModel::with('indicators')->find($batchResp->json('data.member_list.id'));
        $phiEvid = EvidenceModel::with('indicators')->find($batchResp->json('data.phi_journal.id'));

        $this->assertTrue($memberEvid->indicators->contains('code', 'TC-A.2.1'));
        $this->assertTrue($phiEvid->indicators->contains('code', 'TC-C.2.2'));
    }

    public function test_end_to_end_ocop_dossier_lifecycle_with_sweet_palermo(): void
    {
        Storage::fake('local');
        $ctx = $this->setupTestEnvironment();
        $appId = $ctx['application']->id;

        // 1. Get Score Suggestions
        $sugResp = $this->withHeaders($ctx['headers'])
            ->getJson("/api/v1/ocop/applications/{$appId}/score-suggestions");
        $sugResp->assertStatus(200);
        $suggestions = $sugResp->json('data.suggestions');

        // 2. Farmer applies suggested scores into Self Assessments
        foreach ($suggestions as $indCode => $sug) {
            $saveResp = $this->withHeaders($ctx['headers'])
                ->postJson("/api/v1/ocop/applications/{$appId}/self-assessments", [
                    'indicator_id' => $sug['indicator_id'],
                    'score' => $sug['suggested_score'],
                    'explanation' => 'Chủ thể thống nhất áp dụng điểm gợi ý từ hệ thống: '.$sug['reason'],
                ]);
            $saveResp->assertStatus(201);
        }

        // 3. Auto-extract all required internal evidences
        $extResp = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/extract-evidence", [
                'extraction_type' => 'ALL',
            ]);
        $extResp->assertStatus(201);

        // 4. Check OCOP Readiness Report
        $readinessResp = $this->withHeaders($ctx['headers'])
            ->getJson("/api/v1/reports/ocop-readiness/{$appId}");
        $readinessResp->assertStatus(200);
        $this->assertEquals(100.0, $readinessResp->json('data.metrics.self_assessment_completion_rate'));
        $this->assertTrue($readinessResp->json('data.checklist.self_assessment_min_threshold_met'));

        // 5. Generate Official Forms 01, 02, 03
        $this->withHeaders($ctx['headers'])->postJson("/api/v1/documents/generate/form-01/{$appId}")->assertStatus(201);
        $this->withHeaders($ctx['headers'])->postJson("/api/v1/documents/generate/form-02/{$appId}")->assertStatus(201);
        $this->withHeaders($ctx['headers'])->postJson("/api/v1/documents/generate/form-03/{$appId}")->assertStatus(201);

        // 6. Submit Application
        $submitResp = $this->withHeaders($ctx['headers'])
            ->postJson("/api/v1/ocop/applications/{$appId}/submit");
        $submitResp->assertStatus(200);
        $submitResp->assertJsonPath('data.status', 'SUBMITTED');

        // Verify Dossier is Read-Only Locked
        $attemptEdit = $this->withHeaders($ctx['headers'])
            ->patchJson("/api/v1/ocop/applications/{$appId}", ['application_type' => 'UPGRADE']);
        $attemptEdit->assertStatus(400);
        $attemptEdit->assertJsonPath('error.code', 'DOSSIER_READ_ONLY_LOCKED');
    }
}
