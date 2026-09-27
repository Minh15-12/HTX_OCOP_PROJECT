<?php

namespace Modules\Finance\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Finance\Application\DTOs\CreateDebtSettlementDTO;
use Modules\Finance\Application\DTOs\CreateReceivablePayableDTO;
use Modules\Finance\Application\DTOs\UpdateReceivablePayableDTO;
use Modules\Finance\Application\Services\ReceivablePayableService;
use Modules\Finance\Presentation\Http\Requests\CreateDebtSettlementRequest;
use Modules\Finance\Presentation\Http\Requests\CreateReceivablePayableRequest;
use Modules\Finance\Presentation\Http\Requests\UpdateReceivablePayableRequest;
use Modules\Finance\Presentation\Http\Resources\DebtSettlementResource;
use Modules\Finance\Presentation\Http\Resources\ReceivablePayableResource;

class ReceivablePayableController extends BaseController
{
    public function __construct(private readonly ReceivablePayableService $debtService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách công nợ', status: 403);
        }

        $filters = $request->only(['debt_type', 'status', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-created_at');

        $paginator = $this->debtService->listDebts($filters, $perPage, $sort);

        return ApiResponse::success(
            data: ReceivablePayableResource::collection($paginator->items()),
            message: 'Lấy danh sách công nợ thành công',
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
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết công nợ', status: 403);
        }

        $debt = $this->debtService->getDebtById($id);

        return ApiResponse::success(
            data: new ReceivablePayableResource($debt),
            message: 'Lấy chi tiết công nợ thành công'
        );
    }

    public function store(CreateReceivablePayableRequest $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền ghi nhận công nợ mới', status: 403);
        }

        $dto = new CreateReceivablePayableDTO(
            debtType: $request->input('debt_type'),
            counterpartyType: $request->input('counterparty_type'),
            counterpartyName: $request->input('counterparty_name'),
            originalAmount: (float) $request->input('original_amount'),
            dueDate: $request->input('due_date'),
            counterpartyId: $request->input('counterparty_id'),
            description: $request->input('description'),
            customDebtCode: $request->input('custom_debt_code'),
            cooperativeId: $request->input('cooperative_id')
        );

        $debt = $this->debtService->createDebt($dto);

        return ApiResponse::success(
            data: new ReceivablePayableResource($debt),
            message: 'Tạo mới bản ghi công nợ thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateReceivablePayableRequest $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật thông tin công nợ', status: 403);
        }

        $dto = new UpdateReceivablePayableDTO(
            dueDate: $request->input('due_date'),
            description: $request->input('description')
        );

        $debt = $this->debtService->updateDebt($id, $dto);

        return ApiResponse::success(
            data: new ReceivablePayableResource($debt),
            message: 'Cập nhật công nợ thành công'
        );
    }

    public function listSettlements(string $debtId): JsonResponse
    {
        if (!Gate::allows('FINANCE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem lịch sử thanh toán công nợ', status: 403);
        }

        $settlements = $this->debtService->listSettlements($debtId);

        return ApiResponse::success(
            data: DebtSettlementResource::collection($settlements),
            message: 'Lấy lịch sử thanh toán công nợ thành công'
        );
    }

    public function createSettlement(string $debtId, CreateDebtSettlementRequest $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thực hiện thanh toán cấn trừ nợ', status: 403);
        }

        $dto = new CreateDebtSettlementDTO(
            debtId: $debtId,
            settlementDate: $request->input('settlement_date'),
            amount: (float) $request->input('amount'),
            paymentMethod: $request->input('payment_method', 'CASH'),
            referenceNumber: $request->input('reference_number'),
            note: $request->input('note')
        );

        $settlement = $this->debtService->createSettlement($dto);

        return ApiResponse::success(
            data: new DebtSettlementResource($settlement),
            message: 'Thanh toán cấn trừ công nợ thành công',
            status: 201
        );
    }

    public function processHarvestSettlement(Request $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thực hiện quyết toán mùa vụ', status: 403);
        }

        $request->validate([
            'member_id' => ['required', 'uuid', 'exists:members,id'],
            'produce_value' => ['required', 'numeric', 'gt:0'],
            'service_fee_rate' => ['nullable', 'numeric', 'between:0,1'],
        ]);

        $result = $this->debtService->offsetHarvestDebt(
            memberId: $request->input('member_id'),
            harvestProduceValue: (float) $request->input('produce_value'),
            serviceFeeRate: (float) $request->input('service_fee_rate', 0.025)
        );

        return ApiResponse::success(
            data: $result,
            message: 'Quyết toán mùa vụ và cấn trừ công nợ tự động thành công'
        );
    }
}
