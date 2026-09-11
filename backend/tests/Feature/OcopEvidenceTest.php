<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaGroupModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriterionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class OcopEvidenceTest extends TestCase
{
    private function createAuthUser(?CooperativeModel $cooperative = null, string $roleName = 'COOP_ADMIN'): array
    {
        $cooperative = $cooperative ?: CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_EVID_' . Str::random(4),
            'legal_name' => 'HTX Nông Nghiệp Minh Chứng',
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::firstOrCreate(
            ['name' => $roleName],
            ['id' => (string) Str::uuid(), 'display_name' => $roleName, 'description' => $roleName]
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'user_evid_' . Str::random(4),
            'email' => 'user_evid_' . Str::random(4) . '@htx.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Trần Văn Minh Chứng',
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
            'code' => 'PROD-EVID-' . Str::random(4),
            'name' => 'Chè Shan Tuyết OCOP',
            'category' => 'FOOD',
            'unit' => 'KG',
            'status' => 'ACTIVE',
        ]);

        $version = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => 'OCOP-VER-' . Str::random(4),
            'name' => 'Bộ tiêu chí OCOP Thẩm định',
            'status' => 'PUBLISHED',
        ]);

        $group = CriteriaGroupModel::create([
            'id' => (string) Str::uuid(),
            'criteria_version_id' => $version->id,
            'code' => 'G1',
            'name' => 'Nhóm 1',
        ]);

        $criterion = CriterionModel::create([
            'id' => (string) Str::uuid(),
            'criteria_group_id' => $group->id,
            'code' => 'C1',
            'name' => 'Tiêu chí 1',
            'max_score' => 100.0,
        ]);

        $indicator = IndicatorModel::create([
            'id' => (string) Str::uuid(),
            'criterion_id' => $criterion->id,
            'code' => 'I1.1',
            'name' => 'Chỉ tiêu 1.1: Giấy chứng nhận VietGAP',
            'max_score' => 100.0,
        ]);

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperativeId,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'HS-EVID-' . Str::random(4),
            'status' => 'DRAFT',
        ]);

        return [
            'app' => $app,
            'product' => $product,
            'indicator' => $indicator,
        ];
    }

    public function test_upload_evidence_success(): void
    {
        Storage::fake('local');
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        $file = UploadedFile::fake()->create('cert_vietgap.pdf', 1024, 'application/pdf');

        $response = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/evidences", [
                'title' => 'Giấy chứng nhận VietGAP 2026',
                'evidence_type' => 'CERTIFICATE',
                'file' => $file,
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.title', 'Giấy chứng nhận VietGAP 2026');
        $response->assertJsonPath('data.current_version.version_number', 1);

        $this->assertDatabaseHas('evidences', [
            'application_id' => $ctx['app']->id,
            'title' => 'Giấy chứng nhận VietGAP 2026',
            'evidence_type' => 'CERTIFICATE',
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'EVIDENCE_UPLOADED',
        ]);
    }

    public function test_upload_evidence_fails_with_invalid_mime_type(): void
    {
        Storage::fake('local');
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        $invalidFile = UploadedFile::fake()->create('executable_file.exe', 500, 'application/x-msdownload');

        $response = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/evidences", [
                'title' => 'File Không Hợp Lệ',
                'evidence_type' => 'CERTIFICATE',
                'file' => $invalidFile,
            ]);

        $response->assertStatus(422);
    }

    public function test_link_evidence_to_indicator_and_unlink(): void
    {
        Storage::fake('local');
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        $file = UploadedFile::fake()->create('test_photo.jpg', 500, 'image/jpeg');
        $uploadResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/evidences", [
                'title' => 'Ảnh Quy Trình Chế Biến',
                'evidence_type' => 'PROCESS_PHOTO',
                'file' => $file,
            ]);
        $evidenceId = $uploadResp->json('data.id');

        // Link Evidence to Indicator
        $linkResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/evidences/{$evidenceId}/links", [
                'indicator_id' => $ctx['indicator']->id,
                'relevance' => 'HIGH',
                'note' => 'Minh chứng cho tiêu chuẩn vệ sinh an toàn',
            ]);

        $linkResp->assertStatus(201);
        $linkResp->assertJsonPath('success', true);

        $this->assertDatabaseHas('evidence_links', [
            'evidence_id' => $evidenceId,
            'indicator_id' => $ctx['indicator']->id,
        ]);

        // Unlink Evidence from Indicator
        $unlinkResp = $this->withHeaders($auth['headers'])
            ->deleteJson("/api/v1/ocop/evidences/{$evidenceId}/links/{$ctx['indicator']->id}");

        $unlinkResp->assertStatus(200);
        $this->assertDatabaseMissing('evidence_links', [
            'evidence_id' => $evidenceId,
            'indicator_id' => $ctx['indicator']->id,
        ]);
    }

    public function test_replace_evidence_creates_new_version(): void
    {
        Storage::fake('local');
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        // Upload v1
        $file1 = UploadedFile::fake()->create('report_v1.pdf', 800, 'application/pdf');
        $uploadResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/evidences", [
                'title' => 'Báo Cáo Kiểm Nghiệm Đất',
                'evidence_type' => 'LAB_REPORT',
                'file' => $file1,
            ]);
        $evidenceId = $uploadResp->json('data.id');

        // Replace with v2
        $file2 = UploadedFile::fake()->create('report_v2_updated.pdf', 1200, 'application/pdf');
        $replaceResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/evidences/{$evidenceId}/versions", [
                'replacement_reason' => 'Bổ sung kết quả xét nghiệm kim loại nặng mới nhất',
                'file' => $file2,
            ]);

        $replaceResp->assertStatus(201);
        $replaceResp->assertJsonPath('data.current_version.version_number', 2);
        $replaceResp->assertJsonPath('data.current_version.replacement_reason', 'Bổ sung kết quả xét nghiệm kim loại nặng mới nhất');

        // Verify v1 & v2 both exist in DB
        $this->assertDatabaseHas('evidence_versions', [
            'evidence_id' => $evidenceId,
            'version_number' => 1,
        ]);
        $this->assertDatabaseHas('evidence_versions', [
            'evidence_id' => $evidenceId,
            'version_number' => 2,
        ]);

        $this->assertDatabaseHas('audit_events', [
            'action' => 'EVIDENCE_REPLACED',
        ]);
    }

    public function test_generate_signed_download_url(): void
    {
        Storage::fake('local');
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        $file = UploadedFile::fake()->create('doc_legal.pdf', 500, 'application/pdf');
        $uploadResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/evidences", [
                'title' => 'Giấy Đăng Ký Kinh Doanh',
                'evidence_type' => 'LEGAL_DOCUMENT',
                'file' => $file,
            ]);
        $evidenceId = $uploadResp->json('data.id');

        $downloadResp = $this->withHeaders($auth['headers'])
            ->getJson("/api/v1/ocop/evidences/{$evidenceId}/download");

        $downloadResp->assertStatus(200);
        $downloadResp->assertJsonPath('success', true);
        $this->assertNotEmpty($downloadResp->json('data.signed_url'));
    }

    public function test_verify_and_reject_evidence(): void
    {
        Storage::fake('local');
        $auth = $this->createAuthUser();
        $ctx = $this->createApplication($auth['cooperative']->id);

        $file = UploadedFile::fake()->create('photo.png', 400, 'image/png');
        $uploadResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx['app']->id}/evidences", [
                'title' => 'Ảnh Nhãn Hiệu Sản Phẩm',
                'evidence_type' => 'PROCESS_PHOTO',
                'file' => $file,
            ]);
        $evidenceId = $uploadResp->json('data.id');

        // Verify Evidence -> Status becomes VERIFIED
        $verifyResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/evidences/{$evidenceId}/verify", [
                'status' => 'VERIFIED',
            ]);

        $verifyResp->assertStatus(200);
        $verifyResp->assertJsonPath('data.status', 'VERIFIED');

        // Reject Evidence -> Status becomes REJECTED
        $rejectResp = $this->withHeaders($auth['headers'])
            ->postJson("/api/v1/ocop/evidences/{$evidenceId}/verify", [
                'status' => 'REJECTED',
                'reason' => 'Hình ảnh mờ, không rõ thông tin thành phần',
            ]);

        $rejectResp->assertStatus(200);
        $rejectResp->assertJsonPath('data.status', 'REJECTED');

        $this->assertDatabaseHas('audit_events', [
            'action' => 'EVIDENCE_REJECTED',
        ]);
    }

    public function test_tenant_isolation_prevents_access_to_other_cooperative_evidence(): void
    {
        Storage::fake('local');
        $auth1 = $this->createAuthUser();
        $auth2 = $this->createAuthUser();

        $ctx1 = $this->createApplication($auth1['cooperative']->id);

        $file = UploadedFile::fake()->create('secret.pdf', 500, 'application/pdf');
        $uploadResp = $this->withHeaders($auth1['headers'])
            ->postJson("/api/v1/ocop/applications/{$ctx1['app']->id}/evidences", [
                'title' => 'Tài Liệu Bảo Mật HTX 1',
                'evidence_type' => 'LEGAL_DOCUMENT',
                'file' => $file,
            ]);
        $evidenceId = $uploadResp->json('data.id');

        // User from HTX 2 tries to download HTX 1's evidence -> Fails with 403 UNAUTHORIZED_TENANT_ACCESS
        $response = $this->withHeaders($auth2['headers'])
            ->getJson("/api/v1/ocop/evidences/{$evidenceId}");

        $response->assertStatus(403);
        $response->assertJsonPath('error.code', 'UNAUTHORIZED_TENANT_ACCESS');
    }
}
