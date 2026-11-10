<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceVersionModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;
use Tests\TestCase;

class SecurityHardeningAuditTest extends TestCase
{
    private function createCoopAndUser(string $roleCode): array
    {
        $coop = CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_'.Str::random(5),
            'legal_name' => 'HTX Security Hardening Test '.Str::random(3),
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::firstOrCreate(
            ['code' => $roleCode],
            ['id' => (string) Str::uuid(), 'name' => $roleCode, 'display_name' => $roleCode, 'description' => $roleCode]
        );

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'sec_user_'.Str::random(5),
            'email' => 'sec_'.Str::random(5).'@htx.vn',
            'password' => Hash::make('password123'),
            'full_name' => 'Chuyên Viên Kiểm Thử',
            'cooperative_id' => $coop->id,
            'status' => 'ACTIVE',
        ]);

        $user->roles()->sync([$role->id]);
        $token = $user->createToken('sec_token')->plainTextToken;

        return ['coop' => $coop, 'user' => $user, 'token' => $token];
    }

    /** @test */
    public function cross_tenant_header_tampering_is_blocked_and_audited(): void
    {
        $dataA = $this->createCoopAndUser('HTX_OWNER');
        $dataB = $this->createCoopAndUser('HTX_OWNER');

        // HTX Owner of Coop A sends request with X-Cooperative-ID for Coop B
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$dataA['token']}",
            'X-Cooperative-ID' => $dataB['coop']->id,
            'Accept' => 'application/json',
        ])->getJson('/api/v1/cooperatives/my-cooperative');

        $response->assertStatus(403);
        $response->assertJsonPath('error.code', 'UNAUTHORIZED_TENANT_ACCESS');

        // Assert audit log recorded security tampering alert
        $auditLog = AuditEventModel::where('action', 'SECURITY_ALERT_TENANT_TAMPERING')
            ->where('actor_id', $dataA['user']->id)
            ->first();

        $this->assertNotNull($auditLog, 'Tampering event must be recorded in audit log');
        $this->assertEquals($dataA['coop']->id, $auditLog->cooperative_id);
    }

    /** @test */
    public function unsigned_file_streaming_request_is_rejected(): void
    {
        $evidenceId = (string) Str::uuid();

        // Direct request without HMAC signature
        $response = $this->getJson("/api/v1/ocop/evidences/{$evidenceId}/file-stream");

        $response->assertStatus(403);
    }

    /** @test */
    public function signed_file_streaming_succeeds_with_security_headers(): void
    {
        $data = $this->createCoopAndUser('HTX_OWNER');

        $product = ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $data['coop']->id,
            'product_code' => 'PRD-'.Str::random(4),
            'product_name' => 'Sản phẩm thử nghiệm',
            'category' => 'FOOD',
            'status' => 'ACTIVE',
        ]);

        $version = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => 'VER-'.Str::random(4),
            'name' => 'Tiêu chí',
            'status' => 'PUBLISHED',
        ]);

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $data['coop']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'APP-'.Str::random(4),
            'status' => 'DRAFT',
        ]);

        $evidence = EvidenceModel::create([
            'id' => (string) Str::uuid(),
            'application_id' => $app->id,
            'title' => 'Giấy chứng nhận ATTP',
            'evidence_type' => 'CERTIFICATE',
            'status' => 'SUBMITTED',
        ]);

        $filePath = "evidences/{$evidence->id}/test_cert.pdf";
        Storage::disk('local')->put($filePath, 'PDF TEST CONTENT');

        $evidenceVersion = EvidenceVersionModel::create([
            'id' => (string) Str::uuid(),
            'evidence_id' => $evidence->id,
            'version_number' => 1,
            'file_name' => 'test_cert.pdf',
            'file_reference' => $filePath,
            'file_size' => 16,
            'mime_type' => 'application/pdf',
            'checksum' => hash('sha256', 'PDF TEST CONTENT'),
            'uploaded_by' => $data['user']->id,
        ]);

        $evidence->update(['current_version_id' => $evidenceVersion->id]);

        // Generate signed URL via standard service endpoint
        $downloadResp = $this->withHeaders([
            'Authorization' => "Bearer {$data['token']}",
            'Accept' => 'application/json',
        ])->getJson("/api/v1/ocop/evidences/{$evidence->id}/download");

        $downloadResp->assertStatus(200);
        $signedUrl = $downloadResp->json('data.signed_url');
        $this->assertNotEmpty($signedUrl);

        // Access the signed URL directly
        $streamResp = $this->get($signedUrl);
        $streamResp->assertStatus(200);
        $streamResp->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertEquals('PDF TEST CONTENT', $streamResp->streamedContent());

        // Clean up test file
        Storage::disk('local')->delete($filePath);
    }

    /** @test */
    public function low_privilege_storekeeper_is_forbidden_from_submitting_ocop_dossier(): void
    {
        $storekeeperData = $this->createCoopAndUser('STOREKEEPER');

        $product = ProductModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $storekeeperData['coop']->id,
            'product_code' => 'PRD-'.Str::random(4),
            'product_name' => 'Sản phẩm test',
            'category' => 'FOOD',
            'status' => 'ACTIVE',
        ]);

        $version = CriteriaVersionModel::create([
            'id' => (string) Str::uuid(),
            'version_code' => 'VER-'.Str::random(4),
            'name' => 'Tiêu chí test',
            'status' => 'PUBLISHED',
        ]);

        $app = OcopApplicationModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $storekeeperData['coop']->id,
            'product_id' => $product->id,
            'criteria_version_id' => $version->id,
            'application_number' => 'APP-'.Str::random(4),
            'status' => 'READY_FOR_SUBMISSION',
        ]);

        // Storekeeper tries to submit the official legal dossier
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$storekeeperData['token']}",
            'Accept' => 'application/json',
        ])->postJson("/api/v1/ocop/applications/{$app->id}/submit");

        $response->assertStatus(403);
        $response->assertJsonPath('error.code', 'FORBIDDEN_ROLE');
    }

    /** @test */
    public function login_route_is_throttled_after_consecutive_failed_attempts(): void
    {
        RateLimiter::clear('login');

        // 5 requests within limits
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'username' => 'attacker_probe',
                'password' => 'wrong_pass_'.$i,
            ]);
        }

        // 6th request should be throttled
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'attacker_probe',
            'password' => 'wrong_pass_6',
        ]);

        $response->assertStatus(429);
        $response->assertJsonPath('code', 'TOO_MANY_LOGIN_ATTEMPTS');
    }
}
