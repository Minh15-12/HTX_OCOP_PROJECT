<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Application\DTOs\CreateHarvestDTO;
use Modules\Agriculture\Application\DTOs\UpdateHarvestDTO;
use Modules\Agriculture\Application\Services\HarvestService;
use Modules\Agriculture\Presentation\Http\Requests\CreateHarvestRequest;
use Modules\Agriculture\Presentation\Http\Requests\UpdateHarvestRequest;
use Modules\Agriculture\Presentation\Http\Resources\HarvestResource;

class HarvestController extends BaseController
{
    public function __construct(private readonly HarvestService $harvestService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin thu hoạch', status: 403);
        }

        $filters = $request->only(['crop_season_id', 'plot_id', 'date_from', 'date_to']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-harvest_date');

        $paginator = $this->harvestService->listHarvests($filters, $perPage, $sort);

        return ApiResponse::success(
            data: HarvestResource::collection($paginator->items()),
            message: 'Lấy danh sách thu hoạch nông sản thành công',
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
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết bản ghi thu hoạch', status: 403);
        }

        $harvest = $this->harvestService->getHarvestById($id);

        return ApiResponse::success(
            data: new HarvestResource($harvest),
            message: 'Lấy chi tiết bản ghi thu hoạch thành công'
        );
    }

    public function store(CreateHarvestRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền ghi nhận thu hoạch mới', status: 403);
        }

        $dto = new CreateHarvestDTO(
            cropSeasonId: $request->input('crop_season_id'),
            plotId: $request->input('plot_id'),
            harvestDate: $request->input('harvest_date'),
            quantity: (float) $request->input('quantity'),
            unit: $request->input('unit'),
            qualityInformation: $request->input('quality_information'),
            kcsStatus: $request->input('kcs_status', 'PENDING_KCS'),
            kcsGateCheck: $request->input('kcs_gate_check'),
            kcsQuickLab: $request->input('kcs_quick_lab'),
            grade: $request->input('grade', 'GRADE_B'),
            brixLevel: $request->has('brix_level') ? (float) $request->input('brix_level') : null,
            uniformityRate: $request->has('uniformity_rate') ? (float) $request->input('uniformity_rate') : null,
            gradeAKg: $request->has('grade_a_kg') ? (float) $request->input('grade_a_kg') : null,
            gradeBKg: $request->has('grade_b_kg') ? (float) $request->input('grade_b_kg') : null,
            rejectKg: $request->has('reject_kg') ? (float) $request->input('reject_kg') : null
        );

        $harvest = $this->harvestService->createHarvest($dto);

        return ApiResponse::success(
            data: new HarvestResource($harvest),
            message: 'Ghi nhận thu hoạch nông sản thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateHarvestRequest $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật thông tin thu hoạch', status: 403);
        }

        $dto = new UpdateHarvestDTO(
            harvestDate: $request->input('harvest_date'),
            quantity: $request->has('quantity') ? (float) $request->input('quantity') : null,
            unit: $request->input('unit'),
            qualityInformation: $request->input('quality_information'),
            kcsStatus: $request->input('kcs_status'),
            kcsGateCheck: $request->input('kcs_gate_check'),
            kcsQuickLab: $request->input('kcs_quick_lab'),
            grade: $request->input('grade'),
            brixLevel: $request->has('brix_level') ? (float) $request->input('brix_level') : null,
            uniformityRate: $request->has('uniformity_rate') ? (float) $request->input('uniformity_rate') : null,
            gradeAKg: $request->has('grade_a_kg') ? (float) $request->input('grade_a_kg') : null,
            gradeBKg: $request->has('grade_b_kg') ? (float) $request->input('grade_b_kg') : null,
            rejectKg: $request->has('reject_kg') ? (float) $request->input('reject_kg') : null
        );

        $harvest = $this->harvestService->updateHarvest($id, $dto);

        return ApiResponse::success(
            data: new HarvestResource($harvest),
            message: 'Cập nhật thông tin thu hoạch thành công'
        );
    }

    public function gateCheck(string $id, Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thực hiện kiểm tra cổng thu hoạch', status: 403);
        }

        $harvest = $this->harvestService->gateCheck($id, $request->all());

        return ApiResponse::success(
            data: new HarvestResource($harvest),
            message: 'Kiểm tra Gate Check cổng nông trường hoàn tất thành công'
        );
    }

    public function quickLab(string $id, Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật kết quả kiểm nghiệm lab', status: 403);
        }

        $harvest = $this->harvestService->quickLab($id, $request->all());

        return ApiResponse::success(
            data: new HarvestResource($harvest),
            message: 'Ghi nhận kết quả Quick Lab thành công'
        );
    }

    public function grading(string $id, Request $request): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phân loại phẩm cấp thu hoạch', status: 403);
        }

        $harvest = $this->harvestService->grading($id, $request->all());

        return ApiResponse::success(
            data: new HarvestResource($harvest),
            message: 'Phân loại phẩm cấp nông sản hoàn tất thành công'
        );
    }

    public function settleSeason(Request $request, \Modules\Agriculture\Application\Services\HarvestSettlementService $settlementService): JsonResponse
    {
        if (!Gate::allows('AGRICULTURE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thực hiện quyết toán mùa vụ nông sản', status: 403);
        }

        $request->validate([
            'season_id' => ['required', 'uuid', 'exists:crop_seasons,id'],
            'member_id' => ['required', 'uuid', 'exists:members,id'],
            'grade_a_price' => ['nullable', 'numeric', 'min:0'],
            'grade_b_price' => ['nullable', 'numeric', 'min:0'],
            'service_fee_rate' => ['nullable', 'numeric', 'between:0,1'],
        ]);

        $result = $settlementService->settleSeasonHarvests(
            seasonId: $request->input('season_id'),
            memberId: $request->input('member_id'),
            gradeAPrice: $request->filled('grade_a_price') ? (float) $request->input('grade_a_price') : 35000,
            gradeBPrice: $request->filled('grade_b_price') ? (float) $request->input('grade_b_price') : 25000,
            serviceFeeRate: $request->filled('service_fee_rate') ? (float) $request->input('service_fee_rate') : 0.025
        );

        return ApiResponse::success(
            data: $result,
            message: 'Quyết toán sản lượng thu hoạch và cấn trừ nợ thành công'
        );
    }
}
