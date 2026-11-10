<?php

namespace Modules\Finance\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Finance\Application\DTOs\CreateSurplusDistributionPlanDTO;
use Modules\Finance\Application\Services\SurplusDistributionService;
use Modules\Finance\Presentation\Http\Requests\CreateSurplusDistributionPlanRequest;
use Modules\Finance\Presentation\Http\Resources\SurplusDistributionPlanResource;

class SurplusDistributionController extends BaseController
{
    public function __construct(private readonly SurplusDistributionService $surplusService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem phương án phân phối thặng dư', status: 403);
        }

        $filters = $request->only(['financial_year', 'status', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-financial_year');

        $paginator = $this->surplusService->listPlans($filters, $perPage, $sort);

        return ApiResponse::success(
            data: SurplusDistributionPlanResource::collection($paginator->items()),
            message: 'Lấy danh sách phương án phân phối thặng dư thành công',
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
        if (!Gate::allows('FINANCE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết phương án phân phối thặng dư', status: 403);
        }

        $plan = $this->surplusService->getPlanById($id);

        return ApiResponse::success(
            data: new SurplusDistributionPlanResource($plan),
            message: 'Lấy chi tiết phương án phân phối thặng dư thành công'
        );
    }

    public function store(CreateSurplusDistributionPlanRequest $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền lập phương án phân phối thặng dư mới', status: 403);
        }

        $dto = new CreateSurplusDistributionPlanDTO(
            financialYear: (int) $request->input('financial_year'),
            totalSurplus: (float) $request->input('total_surplus'),
            distributableSurplus: (float) $request->input('distributable_surplus'),
            capitalWeight: (float) $request->input('capital_weight', 50.0),
            serviceUsageWeight: (float) $request->input('service_usage_weight', 50.0),
            customPlanCode: $request->input('custom_plan_code'),
            cooperativeId: $request->input('cooperative_id')
        );

        $plan = $this->surplusService->createPlan($dto);

        return ApiResponse::success(
            data: new SurplusDistributionPlanResource($plan),
            message: 'Khởi tạo phương án phân phối thặng dư thành công',
            status: 201
        );
    }

    public function submit(string $id): JsonResponse
    {
        if (!Gate::allows('FINANCE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền gửi duyệt phương án phân phối thặng dư', status: 403);
        }

        $plan = $this->surplusService->submitPlan($id);

        return ApiResponse::success(
            data: new SurplusDistributionPlanResource($plan),
            message: 'Gửi duyệt phương án phân phối thặng dư thành công'
        );
    }

    public function approve(string $id): JsonResponse
    {
        if (!Gate::allows('FINANCE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phê duyệt phương án phân phối thặng dư', status: 403);
        }

        $plan = $this->surplusService->approvePlan($id);

        return ApiResponse::success(
            data: new SurplusDistributionPlanResource($plan),
            message: 'Phê duyệt phương án phân phối thặng dư thành công'
        );
    }

    public function execute(string $id, Request $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thực thi chi trả hoặc tái đầu tư thặng dư', status: 403);
        }

        $options = [
            'reinvest_as_capital' => (bool) $request->input('reinvest_as_capital', false),
            'reinvest_member_ids' => $request->input('reinvest_member_ids'),
            'notes' => $request->input('notes'),
        ];

        $plan = $this->surplusService->executePlan($id, $options);

        return ApiResponse::success(
            data: new SurplusDistributionPlanResource($plan),
            message: $options['reinvest_as_capital']
                ? 'Thực thi phương án thành công: Đã chuyển thặng dư thành vốn góp tái đầu tư và nâng hạn mức tín dụng cho xã viên'
                : 'Thực thi phương án thành công: Đã tạo phiếu chi trả thặng dư cho xã viên'
        );
    }
}
