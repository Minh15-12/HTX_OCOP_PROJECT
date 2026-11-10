<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Shared\Application\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\Services\SeasonReconciliationService;
use Modules\Agriculture\Presentation\Http\Resources\CropSeasonResource;
use Modules\Agriculture\Presentation\Http\Resources\SeasonMaterialReconciliationResource;

class SeasonReconciliationController extends Controller
{
    public function __construct(
        private readonly SeasonReconciliationService $service
    ) {}

    public function index(string $seasonId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin đối soát vật tư mùa vụ', status: 403);
        }

        $records = $this->service->getReconciliationsBySeason($seasonId);

        return ApiResponse::success(
            data: SeasonMaterialReconciliationResource::collection($records),
            message: 'Lấy dữ liệu đối soát cân bằng vật tư thành công'
        );
    }

    public function store(Request $request, string $seasonId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật đối soát cân bằng vật tư', status: 403);
        }

        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.material_id' => ['required', 'uuid'],
            'items.*.material_name' => ['nullable', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:30'],
            'items.*.opening_balance' => ['nullable', 'numeric', 'min:0'],
            'items.*.received_from_coop' => ['nullable', 'numeric', 'min:0'],
            'items.*.used_in_logbook' => ['nullable', 'numeric', 'min:0'],
            'items.*.actual_closing_balance' => ['nullable', 'numeric', 'min:0'],
            'items.*.empty_packaging_returned' => ['nullable', 'integer', 'min:0'],
            'items.*.waste_disposal_slip_code' => ['nullable', 'string', 'max:100'],
            'items.*.reconciliation_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $records = $this->service->saveReconciliation($seasonId, $validated['items']);

        return ApiResponse::success(
            data: SeasonMaterialReconciliationResource::collection($records),
            message: 'Lưu biên bản đối soát cân bằng vật tư thành công'
        );
    }

    public function freeze(string $seasonId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thực hiện khóa sổ mùa vụ', status: 403);
        }

        $season = $this->service->freezeLogbook($seasonId);

        return ApiResponse::success(
            data: new CropSeasonResource($season),
            message: 'Khóa sổ mùa vụ và thiết lập chữ ký chuỗi băm Merkle/SHA-256 thành công'
        );
    }
}
