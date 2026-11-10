<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CropController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('crops');

        if ($request->filled('category') && $request->input('category') !== 'ALL') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('search')) {
            $search = '%'.trim($request->input('search')).'%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('crop_code', $likeOp, $search)
                    ->orWhere('name', $likeOp, $search)
                    ->orWhere('scientific_name', $likeOp, $search)
                    ->orWhere('category', $likeOp, $search);
            });
        }

        $crops = $query->orderBy('name')->get();

        return ApiResponse::success(
            data: $crops,
            message: 'Lấy danh mục giống cây trồng thành công'
        );
    }

    public function show(string $id): JsonResponse
    {
        $crop = DB::table('crops')->where('id', $id)->first();
        if (!$crop) {
            return ApiResponse::error('CROP_NOT_FOUND', 'Không tìm thấy thông tin giống cây trồng', status: 404);
        }

        return ApiResponse::success(data: $crop, message: 'Lấy chi tiết giống cây trồng thành công');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'crop_code' => 'required|string|max:50|unique:crops,crop_code',
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $id = (string) Str::uuid();
        $now = now();

        DB::table('crops')->insert([
            'id' => $id,
            'crop_code' => $validated['crop_code'],
            'name' => $validated['name'],
            'scientific_name' => $validated['scientific_name'] ?? null,
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $created = DB::table('crops')->where('id', $id)->first();

        return ApiResponse::success(data: $created, message: 'Tạo mới giống cây trồng thành công', status: 201);
    }
}
