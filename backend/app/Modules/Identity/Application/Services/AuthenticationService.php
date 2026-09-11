<?php

namespace Modules\Identity\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\Hash;
use Modules\Audit\Application\Services\AuditService;
use Modules\Identity\Application\DTOs\LoginData;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class AuthenticationService
{
    public function __construct(private readonly AuditService $auditService) {}

    public function login(LoginData $dto): array
    {
        $user = UserModel::with(['roles.permissions', 'cooperative'])
            ->where('username', $dto->username)
            ->orWhere('email', $dto->username)
            ->first();

        if (!$user || !Hash::check($dto->password, $user->password)) {
            $this->auditService->log(
                action: 'AUTH_LOGIN_FAILED',
                entityType: 'User',
                entityId: null,
                after: ['username' => $dto->username]
            );
            throw new DomainException('Tài khoản hoặc mật khẩu không chính xác', 'INVALID_CREDENTIALS', null, 401);
        }

        if ($user->status !== 'ACTIVE') {
            throw new DomainException('Tài khoản đã bị khóa hoặc ngưng hoạt động', 'ACCOUNT_DISABLED', null, 403);
        }

        // Issue Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        $user->update(['last_login_at' => now()]);

        // Audit log
        $this->auditService->log(
            action: 'AUTH_LOGIN',
            entityType: 'User',
            entityId: $user->id,
            actorId: $user->id,
            cooperativeId: $user->cooperative_id
        );

        $roles = $user->roles->pluck('code')->toArray();
        $permissions = $user->roles->flatMap->permissions->pluck('code')->unique()->values()->toArray();

        return [
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'cooperative_id' => $user->cooperative_id,
                'cooperative_name' => $user->cooperative?->legal_name,
                'status' => $user->status,
                'roles' => $roles,
                'permissions' => $permissions,
            ],
        ];
    }

    public function logout(UserModel $user): void
    {
        $user->currentAccessToken()->delete();

        $this->auditService->log(
            action: 'AUTH_LOGOUT',
            entityType: 'User',
            entityId: $user->id,
            actorId: $user->id,
            cooperativeId: $user->cooperative_id
        );
    }

    public function getUserInfo(UserModel $user): array
    {
        $user->loadMissing(['roles.permissions', 'cooperative']);
        $roles = $user->roles->pluck('code')->toArray();
        $permissions = $user->roles->flatMap->permissions->pluck('code')->unique()->values()->toArray();

        return [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'cooperative_id' => $user->cooperative_id,
            'cooperative_name' => $user->cooperative?->legal_name,
            'status' => $user->status,
            'roles' => $roles,
            'permissions' => $permissions,
        ];
    }
}
