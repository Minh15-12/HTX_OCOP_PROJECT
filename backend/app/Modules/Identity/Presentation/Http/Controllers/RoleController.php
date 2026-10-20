<?php

namespace Modules\Identity\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;

class RoleController extends BaseController
{
    public function __construct(private readonly AuditService $auditService) {}

    public function index(Request $request): JsonResponse
    {
        if (!\Illuminate\Support\Facades\Gate::allows('ROLE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách vai trò', status: 403);
        }

        $roles = RoleModel::with(['permissions'])->withCount('permissions')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'code' => $role->code,
                'name' => $role->name,
                'description' => $role->description,
                'user_count' => \DB::table('user_roles')->where('role_id', $role->id)->count(),
                'status' => 'ACTIVE',
                'permissions' => $role->permissions->pluck('code')->toArray(),
                'created_at' => $role->created_at?->toIso8601String(),
            ];
        });

        return ApiResponse::success(
            data: $roles,
            message: 'Lấy danh sách vai trò thành công'
        );
    }

    public function store(Request $request): JsonResponse
    {
        if (!\Illuminate\Support\Facades\Gate::allows('ROLE.MANAGE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền quản lý vai trò', status: 403);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:roles,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,code',
        ]);

        $role = RoleModel::create([
            'id' => (string) Str::uuid(),
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if (!empty($validated['permissions'])) {
            $permIds = PermissionModel::whereIn('code', $validated['permissions'])->pluck('id');
            $role->permissions()->sync($permIds);
        }

        $this->auditService->log(
            action: 'ROLE_CREATED',
            entityType: 'Role',
            entityId: $role->id,
            after: ['code' => $role->code, 'name' => $role->name]
        );

        return ApiResponse::success(
            data: $role->load('permissions'),
            message: 'Tạo vai trò mới thành công',
            status: 201
        );
    }

    public function show(string $id): JsonResponse
    {
        if (!\Illuminate\Support\Facades\Gate::allows('ROLE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin vai trò', status: 403);
        }

        $role = RoleModel::with('permissions')->find($id);
        if (!$role) {
            return ApiResponse::error('NOT_FOUND', 'Không tìm thấy vai trò', status: 404);
        }

        return ApiResponse::success(
            data: [
                'id' => $role->id,
                'code' => $role->code,
                'name' => $role->name,
                'description' => $role->description,
                'permissions' => $role->permissions->pluck('code')->toArray(),
            ],
            message: 'Lấy chi tiết vai trò thành công'
        );
    }

    public function update(Request $request, string $id): JsonResponse
    {
        if (!\Illuminate\Support\Facades\Gate::allows('ROLE.MANAGE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền chỉnh sửa vai trò', status: 403);
        }

        $role = RoleModel::find($id);
        if (!$role) {
            return ApiResponse::error('NOT_FOUND', 'Không tìm thấy vai trò', status: 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $role->update($validated);

        $this->auditService->log(
            action: 'ROLE_UPDATED',
            entityType: 'Role',
            entityId: $role->id,
            after: $validated
        );

        return ApiResponse::success(
            data: $role,
            message: 'Cập nhật vai trò thành công'
        );
    }

    public function updatePermissions(Request $request, string $id): JsonResponse
    {
        if (!\Illuminate\Support\Facades\Gate::allows('ROLE.MANAGE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thay đổi ma trận phân quyền', status: 403);
        }

        $role = RoleModel::find($id);
        if (!$role) {
            return ApiResponse::error('NOT_FOUND', 'Không tìm thấy vai trò', status: 404);
        }

        $validated = $request->validate([
            'permissions' => 'present|array',
            'permissions.*' => 'string|exists:permissions,code',
        ]);

        $permIds = PermissionModel::whereIn('code', $validated['permissions'])->pluck('id');
        $role->permissions()->sync($permIds);

        $this->auditService->log(
            action: 'ROLE_PERMISSIONS_UPDATED',
            entityType: 'Role',
            entityId: $role->id,
            after: ['permissions' => $validated['permissions']]
        );

        return ApiResponse::success(
            data: [
                'id' => $role->id,
                'code' => $role->code,
                'permissions' => $role->permissions()->pluck('code')->toArray(),
            ],
            message: 'Cập nhật quyền cho vai trò thành công'
        );
    }
}
