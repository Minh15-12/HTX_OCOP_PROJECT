<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Tests\TestCase;

class AuthTest extends TestCase
{
    private function createCooperative(): CooperativeModel
    {
        return CooperativeModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_code' => 'HTX_'.Str::random(5),
            'legal_name' => 'HTX Nông Nghiệp Thử Nghiệm',
            'status' => 'ACTIVE',
        ]);
    }

    public function test_login_validation_fails_when_username_or_password_empty(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'VALIDATION_FAILED');
    }

    public function test_unauthenticated_user_cannot_access_protected_me_route(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
        $response->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }

    public function test_invalid_token_returns_401_unauthenticated(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid_token_1234567890',
        ])->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
        $response->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }

    public function test_user_can_login_successfully_with_valid_credentials(): void
    {
        $cooperative = $this->createCooperative();
        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'testuser_'.Str::random(4),
            'email' => 'testuser_'.Str::random(4).'@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Nguyễn Văn A',
            'cooperative_id' => $cooperative->id,
            'status' => 'ACTIVE',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.user.username', $user->username);
        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $cooperative = $this->createCooperative();
        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'testuser2_'.Str::random(4),
            'email' => 'testuser2_'.Str::random(4).'@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Nguyễn Văn B',
            'cooperative_id' => $cooperative->id,
            'status' => 'ACTIVE',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
    }

    public function test_suspended_user_cannot_login(): void
    {
        $cooperative = $this->createCooperative();
        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => 'suspended_'.Str::random(4),
            'email' => 'suspended_'.Str::random(4).'@example.com',
            'password' => Hash::make('password123'),
            'full_name' => 'Trần Văn C',
            'cooperative_id' => $cooperative->id,
            'status' => 'SUSPENDED',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
        $response->assertJsonPath('error.code', 'ACCOUNT_DISABLED');
    }
}
