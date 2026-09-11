<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\FinalDecisionModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class AuditAndReportTest extends TestCase
{
    private function createAuthUser(?CooperativeModel $cooperative = null, string $roleName = 'COOP_ADMIN'): array
    {
        $cooperative = $cooperative ?: CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_RPT_' . Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp Báo Cáo',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::firstOrCreate(
            ['name' => $roleName],
            ['id' => (string) Str::uuid(), 'display_name' => $roleName, 'description' => $roleName]
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'user_rpt_' . Str::random(4),
            'email' => 'user_rpt_' . Str::random(4) . '@htx.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Nguyễn Văn Báo Cáo',
            'cooperative_id' => $cooperative->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->attach($role->id);
        $token = $user->createToken('test_token')->plainTextToken;

        return [
            'user' => $user,
            'cooperative' => $cooperative,
            'token' => $token,
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ],
        ];
    }

    private function createApplication(string $cooperativeId): array
    {
        $product = ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperativeId,
            'code' => 'PROD-RPT-' . Str::random(4),
            'name' => 'Mật Ong Rừng OCOP',
            'category' => 'FOOD',
            'unit' => 'BOTTLE',
            'status' => 'ACTIVE',
        ]);

        $version = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => 'VER-RPT-' . Str::random(4),
            'name' => 'Bộ tiêu chí OCOP 2026',
            'status' => 'PUBLISHED',
        ]);

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperativeId,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-RPT-' . Str::random(4),
            'status' => 'APPROVED',
        ]);

        return [
            'app' => $app,
            'product' => $product,
            'version' => $version,
        ];
    }

    public function test_list_and_filter_audit_logs(): void
    {
        $auth = $this->createAuthUser();

        $event1 = AuditEventModel::create([
            'id' => (string) Str::uuid(),
            'actor_id' => $auth['user']->id,
            'action' => 'EVIDENCE_UPLOADED',
            'entity_type' => 'Evidence',
            'entity_id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'created_at' => now(),
        ]);

        $event2 = AuditEventModel::create([
            'id' => (string) Str::uuid(),
            'actor_id' => $auth['user']->id,
            'action' => 'OCOP_RESULT_APPROVED',
            'entity_type' => 'FinalDecision',
            'entity_id' => (string) Str::uuid(),
            'cooperative_id' => $auth['cooperative']->id,
            'created_at' => now(),
        ]);

        // Query Audit Logs List
        $response = $this->withHeaders($auth['headers'])
            ->getJson('/api/v1/audit-logs?action=EVIDENCE_UPLOADED');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $event1->id);

        // Query Audit Detail
        $detailResp = $this->withHeaders($auth['headers'])
            ->getJson("/api/v1/audit-logs/{$event2->id}");

        $detailResp->assertStatus(200);
        $detailResp->assertJsonPath('data.action', 'OCOP_RESULT_APPROVED');
    }

    public function test_audit_logs_are_immutable_no_update_or_delete_routes(): void
    {
        $auth = $this->createAuthUser();
        $event = AuditEventModel::create([
            'id' => (string) Str::uuid(),
            'actor_id' => $auth['user']->id,
            'action' => 'MEMBER_APPROVED',
            'entity_type' => 'Member',
            'entity_id' => (string) Str::uuid(),
            'created_at' => now(),
        ]);

        // PUT request should return 405 Method Not Allowed / 404
        $putResp = $this->withHeaders($auth['headers'])
            ->putJson("/api/v1/audit-logs/{$event->id}", ['action' => 'MODIFIED']);
        $this->assertTrue(in_array($putResp->status(), [404, 405], true));

        // DELETE request should return 405 Method Not Allowed / 404
        $delResp = $this->withHeaders($auth['headers'])
            ->deleteJson("/api/v1/audit-logs/{$event->id}");
        $this->assertTrue(in_array($delResp->status(), [404, 405], true));
    }

    public function test_trace_ocop_application_lifecycle(): void
    {
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        AuditEventModel::create([
            'id' => (string) Str::uuid(),
            'actor_id' => $auth['user']->id,
            'action' => 'OCOP_APPLICATION_CREATED',
            'entity_type' => 'OcopApplication',
            'entity_id' => $ctx['app']->id,
            'cooperative_id' => $auth['cooperative']->id,
            'created_at' => now(),
        ]);

        $traceResp = $this->withHeaders($auth['headers'])
            ->getJson("/api/v1/audit-logs/trace/ocop/{$ctx['app']->id}");

        $traceResp->assertStatus(200);
        $traceResp->assertJsonPath('success', true);
        $traceResp->assertJsonPath('data.application.id', $ctx['app']->id);
        $traceResp->assertJsonPath('data.application.status', 'APPROVED');
    }

    public function test_dashboard_summary_report(): void
    {
        $auth = $this->createAuthUser();
        $this->createApplication($auth['cooperative']->id);

        $response = $this->withHeaders($auth['headers'])
            ->getJson('/api/v1/reports/dashboard');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.cooperative_id', $auth['cooperative']->id);
        $this->assertArrayHasKey('members', $response->json('data'));
        $this->assertArrayHasKey('ocop_applications', $response->json('data'));
    }

    public function test_ocop_readiness_checklist(): void
    {
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        $response = $this->withHeaders($auth['headers'])
            ->getJson("/api/v1/reports/ocop-readiness/{$ctx['app']->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.application_id', $ctx['app']->id);
        $this->assertArrayHasKey('metrics', $response->json('data'));
        $this->assertArrayHasKey('checklist', $response->json('data'));
    }

    public function test_generate_dossier_pdf_and_download(): void
    {
        Storage::fake('local');
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        // Request dossier PDF generation
        $genResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/documents/generate/ocop-dossier/{$ctx['app']->id}");

        $genResp->assertStatus(201);
        $genResp->assertJsonPath('success', true);
        $genResp->assertJsonPath('data.document_type', 'OCOP_DOSSIER');
        $genResp->assertJsonPath('data.source_entity_id', $ctx['app']->id);

        $docId = $genResp->json('data.id');
        $this->assertNotEmpty($genResp->json('data.checksum'));

        // Download generated document
        $downResp = $this->withHeaders($auth['headers'])
            ->getJson("/api/v1/documents/{$docId}/download");

        $downResp->assertStatus(200);
        $this->assertStringContainsString('BỘ HỒ SƠ ĐÁNH GIÁ VÀ PHÂN HẠNG SẢN PHẨM OCOP', $downResp->getContent());

        $this->assertDatabaseHas('generated_documents', [
            'id' => $docId,
            'document_type' => 'OCOP_DOSSIER',
        ]);
        $this->assertDatabaseHas('audit_events', [
            'action' => 'DOCUMENT_GENERATED',
        ]);
    }

    public function test_generate_certificate_pdf_and_download(): void
    {
        Storage::fake('local');
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        // Attach Final Decision (APPROVED)
        $decision = FinalDecisionModel::create([
            'id' => (string) Str::uuid(),
            'application_id' => $ctx['app']->id,
            'decision_number' => 'QD-999/UBND-OCOP',
            'decision_date' => '2026-09-04',
            'final_classification' => '4_STAR',
            'status' => 'ISSUED',
        ]);

        // Request certificate generation
        $certResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/documents/generate/certificate/{$ctx['app']->id}");

        $certResp->assertStatus(201);
        $certResp->assertJsonPath('success', true);
        $certResp->assertJsonPath('data.document_type', 'OCOP_CERTIFICATE');

        $docId = $certResp->json('data.id');

        // Download Certificate
        $downResp = $this->withHeaders($auth['headers'])
            ->getJson("/api/v1/documents/{$docId}/download");

        $downResp->assertStatus(200);
        $this->assertStringContainsString('GIẤY CHỨNG NHẬN SẢN PHẨM OCOP', $downResp->getContent());
        $this->assertStringContainsString('QD-999/UBND-OCOP', $downResp->getContent());

        $this->assertDatabaseHas('audit_events', [
            'action' => 'CERTIFICATE_GENERATED',
        ]);
    }
}
