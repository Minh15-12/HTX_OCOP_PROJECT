<?php

namespace Modules\Identity\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Identity\Presentation\Http\Resources\UserResource;

class UserController extends BaseController
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('USER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách người dùng', status: 403);
        }

        $query = UserModel::with(['roles', 'cooperative']);

        // Multi-tenant scope filtering
        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $users = $query->paginate(15);

        return ApiResponse::success(
            data: UserResource::collection($users),
            message: 'Lấy danh sách người dùng thành công'
        );
    }

    public function store(Request $request): JsonResponse
    {
        if (!Gate::allows('USER.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền tạo mới người dùng', status: 403);
        }

        $validated = $request->validate([
            'username' => 'required|string|max:100|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'full_name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:30',
            'role_code' => 'required|string|exists:roles,code',
        ]);

        $cooperativeId = $this->tenantContext->getCooperativeId() ?: $request->input('cooperative_id');

        $user = UserModel::create([
            'id' => (string) Str::uuid(),
            'username' => $validated['username'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'full_name' => $validated['full_name'],
            'phone_number' => $validated['phone_number'] ?? null,
            'cooperative_id' => $cooperativeId,
            'status' => 'ACTIVE',
        ]);

        $role = RoleModel::where('code', $validated['role_code'])->first();
        if ($role) {
            $user->roles()->attach($role->id);
        }

        $this->auditService->log(
            action: 'USER_CREATED',
            entityType: 'User',
            entityId: $user->id,
            after: ['username' => $user->username, 'role' => $validated['role_code']],
            cooperativeId: $cooperativeId
        );

        return ApiResponse::success(
            data: new UserResource($user->load(['roles', 'cooperative'])),
            message: 'Tạo mới người dùng thành công',
            status: 201
        );
    }
}
