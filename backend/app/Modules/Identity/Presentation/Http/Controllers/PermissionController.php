<?php

namespace Modules\Identity\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;

class PermissionController extends BaseController
{
    public function index(): JsonResponse
    {
        $permissions = PermissionModel::all();

        $grouped = $permissions->groupBy('module')->map(function ($items, $module) {
            return [
                'module' => $module,
                'permissions' => $items->map(fn ($p) => [
                    'id' => $p->id,
                    'code' => $p->code,
                    'name' => $p->name,
                    'module' => $p->module,
                ])->values()->toArray(),
            ];
        })->values();

        return ApiResponse::success(
            data: [
                'all' => $permissions->pluck('code')->toArray(),
                'grouped' => $grouped,
            ],
            message: 'Lấy danh mục quyền hệ thống thành công'
        );
    }
}
