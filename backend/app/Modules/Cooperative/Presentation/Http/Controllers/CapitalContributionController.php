<?php

namespace Modules\Cooperative\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Cooperative\Application\DTOs\CreateCapitalContributionDTO;
use Modules\Cooperative\Application\Services\CapitalContributionService;
use Modules\Cooperative\Presentation\Http\Requests\CreateCapitalContributionRequest;
use Modules\Cooperative\Presentation\Http\Resources\CapitalContributionResource;

class CapitalContributionController extends BaseController
{
    public function __construct(private readonly CapitalContributionService $contributionService) {}

    public function index(string $memberId, Request $request): JsonResponse
    {
        if (!Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin góp vốn', status: 403);
        }

        $perPage = (int) $request->input('per_page', 15);
        $result = $this->contributionService->listMemberContributions($memberId, $perPage);
        $paginator = $result['paginator'];

        return ApiResponse::success(
            data: CapitalContributionResource::collection($paginator->items()),
            message: 'Lấy lịch sử góp vốn xã viên thành công',
            meta: [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'total_contribution_amount' => $result['total_contribution'],
            ]
        );
    }

    public function show(string $id): JsonResponse
    {
        if (!Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết góp vốn', status: 403);
        }

        $contribution = $this->contributionService->getContributionById($id);

        return ApiResponse::success(
            data: new CapitalContributionResource($contribution),
            message: 'Lấy thông tin chi tiết góp vốn thành công'
        );
    }

    public function store(string $memberId, CreateCapitalContributionRequest $request): JsonResponse
    {
        if (!Gate::allows('MEMBER.UPDATE') && !Gate::allows('FINANCE.TRANSACTION.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền lập khoản góp vốn cho xã viên', status: 403);
        }

        $dto = new CreateCapitalContributionDTO(
            memberId: $memberId,
            contributionType: $request->input('contribution_type'),
            amount: (float) $request->input('amount'),
            transactionDate: $request->input('transaction_date'),
            valueDescription: $request->input('value_description'),
            evidenceReference: $request->input('evidence_reference'),
            landCertificateNo: $request->input('land_certificate_no'),
            plotNumber: $request->input('plot_number'),
            mapSheetNumber: $request->input('map_sheet_number'),
            landAreaSqm: $request->input('land_area_sqm') ? (float) $request->input('land_area_sqm') : null,
            landUseType: $request->input('land_use_type'),
            appraisedUnitPrice: $request->input('appraised_unit_price') ? (float) $request->input('appraised_unit_price') : null
        );

        $contribution = $this->contributionService->createContribution($dto);

        return ApiResponse::success(
            data: new CapitalContributionResource($contribution),
            message: 'Ghi nhận góp vốn xã viên thành công',
            status: 201
        );
    }
}
