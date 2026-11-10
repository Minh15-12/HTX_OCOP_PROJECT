<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\CreateCropSeasonDTO;
use Modules\Agriculture\Application\DTOs\UpdateCropSeasonDTO;
use Modules\Agriculture\Application\Services\CropSeasonService;
use Modules\Agriculture\Presentation\Http\Requests\CreateCropSeasonRequest;
use Modules\Agriculture\Presentation\Http\Requests\UpdateCropSeasonRequest;
use Modules\Agriculture\Presentation\Http\Requests\AllocateCropSeasonPlotRequest;
use Modules\Agriculture\Presentation\Http\Requests\SaveCropSeasonBomRequest;
use Modules\Agriculture\Presentation\Http\Resources\CropSeasonResource;
use Modules\Agriculture\Presentation\Http\Resources\CropSeasonPlotResource;
use Modules\Agriculture\Presentation\Http\Resources\CropSeasonBomResource;

class CropSeasonController extends BaseController
{
    public function __construct(private readonly CropSeasonService $seasonService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách mùa vụ', status: 403);
        }

        $filters = $request->only(['production_unit_id', 'status', 'crop', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-created_at');

        $paginator = $this->seasonService->listSeasons($filters, $perPage, $sort);

        return ApiResponse::success(
            data: CropSeasonResource::collection($paginator->items()),
            message: 'Lấy danh sách mùa vụ sản xuất thành công',
            meta: [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ]
        );
    }

    public function show(string $id): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin mùa vụ', status: 403);
        }

        $season = $this->seasonService->getSeasonById($id);

        return ApiResponse::success(
            data: new CropSeasonResource($season),
            message: 'Lấy thông tin mùa vụ sản xuất thành công'
        );
    }

    public function store(CreateCropSeasonRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền tạo mới mùa vụ', status: 403);
        }

        $dto = new CreateCropSeasonDTO(
            productionUnitId: $request->input('production_unit_id'),
            name: $request->input('name'),
            crop: $request->input('crop'),
            startDate: $request->input('start_date'),
            expectedEndDate: $request->input('expected_end_date'),
            planInformation: $request->input('plan_information'),
            seedSupplier: $request->input('seed_supplier'),
            seedlingStandardChecklist: $request->input('seedling_standard_checklist'),
            buyerContractInfo: $request->input('buyer_contract_info'),
            pucQuotaKg: $request->input('puc_quota_kg') ? (float) $request->input('puc_quota_kg') : null
        );

        $season = $this->seasonService->createSeason($dto);

        return ApiResponse::success(
            data: new CropSeasonResource($season),
            message: 'Tạo mới mùa vụ sản xuất thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateCropSeasonRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật mùa vụ', status: 403);
        }

        $dto = new UpdateCropSeasonDTO(
            name: $request->input('name'),
            crop: $request->input('crop'),
            startDate: $request->input('start_date'),
            expectedEndDate: $request->input('expected_end_date'),
            status: $request->input('status'),
            planInformation: $request->input('plan_information'),
            seedSupplier: $request->input('seed_supplier'),
            seedlingStandardChecklist: $request->input('seedling_standard_checklist'),
            buyerContractInfo: $request->input('buyer_contract_info'),
            pucQuotaKg: $request->has('puc_quota_kg') ? (float) $request->input('puc_quota_kg') : null
        );

        $season = $this->seasonService->updateSeason($id, $dto);

        return ApiResponse::success(
            data: new CropSeasonResource($season),
            message: 'Cập nhật mùa vụ sản xuất thành công'
        );
    }

    public function close(string $id, Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền đóng mùa vụ', status: 403);
        }

        $actualEndDate = $request->input('actual_end_date');
        $season = $this->seasonService->closeSeason($id, $actualEndDate);

        return ApiResponse::success(
            data: new CropSeasonResource($season),
            message: 'Đóng mùa vụ sản xuất thành công'
        );
    }

    public function plots(string $id): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin thửa đất mùa vụ', status: 403);
        }

        $plots = $this->seasonService->getAllocatedPlots($id);

        return ApiResponse::success(
            data: CropSeasonPlotResource::collection($plots),
            message: 'Lấy danh sách thửa đất phân bổ cho mùa vụ thành công'
        );
    }

    public function allocatePlot(string $id, AllocateCropSeasonPlotRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phân bổ thửa đất cho mùa vụ', status: 403);
        }

        $allocation = $this->seasonService->allocatePlot($id, $request->validated());

        return ApiResponse::success(
            data: new CropSeasonPlotResource($allocation),
            message: 'Phân bổ thửa đất vào kế hoạch mùa vụ thành công',
            status: 201
        );
    }

    public function removePlot(string $id, string $plotId): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền hủy phân bổ thửa đất', status: 403);
        }

        $this->seasonService->removePlotAllocation($id, $plotId);

        return ApiResponse::success(
            message: 'Hủy phân bổ thửa đất khỏi mùa vụ thành công'
        );
    }

    public function boms(string $id): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem dự toán vật tư mùa vụ', status: 403);
        }

        $boms = $this->seasonService->getSeasonBoms($id);

        return ApiResponse::success(
            data: CropSeasonBomResource::collection($boms),
            message: 'Lấy danh mục dự toán vật tư mùa vụ thành công'
        );
    }

    public function saveBom(string $id, SaveCropSeasonBomRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật dự toán vật tư mùa vụ', status: 403);
        }

        $boms = $this->seasonService->saveSeasonBom($id, $request->input('items', []));

        return ApiResponse::success(
            data: CropSeasonBomResource::collection($boms),
            message: 'Lưu bảng dự toán định mức vật tư mùa vụ thành công'
        );
    }

    public function supplyDemand(string $id): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thống kê cung cầu mùa vụ', status: 403);
        }

        $balance = $this->seasonService->getSupplyDemandBalance($id);

        return ApiResponse::success(
            data: $balance,
            message: 'Lấy dữ liệu cân đối cung cầu hợp đồng bao tiêu thành công'
        );
    }

    public function bulkAllocatePlots(string $id, Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phân bổ thửa đất cho mùa vụ', status: 403);
        }

        $validated = $request->validate([
            'plot_ids' => 'required|array|min:1',
            'plot_ids.*' => 'required|uuid',
            'planting_date' => 'nullable|date',
            'expected_harvest_start' => 'nullable|date',
            'expected_harvest_end' => 'nullable|date',
            'crop_variety' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:PLANNED,PLANTED,GROWING,HARVESTING,COMPLETED,CANCELLED',
            'notes' => 'nullable|string|max:500',
        ]);

        $allocations = $this->seasonService->bulkAllocatePlots($id, $validated['plot_ids'], $validated);

        return ApiResponse::success(
            data: CropSeasonPlotResource::collection($allocations),
            message: 'Phân bổ hàng loạt thửa đất vào kế hoạch mùa vụ thành công',
            status: 201
        );
    }

    public function bomPresets(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền truy cập định mức vật tư mẫu', status: 403);
        }

        $crop = $request->query('crop');
        $presets = $this->seasonService->getBomPresets($crop);

        return ApiResponse::success(
            data: $presets,
            message: 'Lấy danh mục định mức VietGAP mẫu theo cây trồng thành công'
        );
    }
}

