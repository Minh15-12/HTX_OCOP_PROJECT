<?php

namespace Modules\Finance\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Finance\Application\DTOs\CreateCashTransactionDTO;
use Modules\Finance\Application\Services\CashTransactionService;
use Modules\Finance\Presentation\Http\Requests\CreateCashTransactionRequest;
use Modules\Finance\Presentation\Http\Resources\CashTransactionResource;

class CashTransactionController extends BaseController
{
    public function __construct(private readonly CashTransactionService $cashService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem sổ quỹ tiền mặt', status: 403);
        }

        $filters = $request->only(['transaction_type', 'status', 'category', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-transaction_date');

        $paginator = $this->cashService->listTransactions($filters, $perPage, $sort);
        $cashBalance = $this->cashService->calculateCashBalance();

        return ApiResponse::success(
            data: CashTransactionResource::collection($paginator->items()),
            message: 'Lấy sổ quỹ tiền mặt thành công',
            meta: [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'current_cash_balance' => $cashBalance,
            ]
        );
    }

    public function show(string $id): JsonResponse
    {
        if (!Gate::allows('FINANCE.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết giao dịch tiền mặt', status: 403);
        }

        $tx = $this->cashService->getTransactionById($id);

        return ApiResponse::success(
            data: new CashTransactionResource($tx),
            message: 'Lấy chi tiết giao dịch tiền mặt thành công'
        );
    }

    public function store(CreateCashTransactionRequest $request): JsonResponse
    {
        if (!Gate::allows('FINANCE.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền lập phiếu thu/chi mới', status: 403);
        }

        $dto = new CreateCashTransactionDTO(
            transactionType: $request->input('transaction_type'),
            amount: (float) $request->input('amount'),
            transactionDate: $request->input('transaction_date'),
            category: $request->input('category'),
            description: $request->input('description'),
            payerPayee: $request->input('payer_payee'),
            memberId: $request->input('member_id'),
            evidenceReference: $request->input('evidence_reference'),
            customVoucherNumber: $request->input('custom_voucher_number'),
            cooperativeId: $request->input('cooperative_id')
        );

        $tx = $this->cashService->createTransaction($dto);

        return ApiResponse::success(
            data: new CashTransactionResource($tx),
            message: 'Khởi tạo phiếu thu/chi tiền mặt thành công',
            status: 201
        );
    }

    public function approve(string $id): JsonResponse
    {
        if (!Gate::allows('FINANCE.TRANSACTION.APPROVE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phê duyệt phiếu thu/chi', status: 403);
        }

        $tx = $this->cashService->approveTransaction($id);

        return ApiResponse::success(
            data: new CashTransactionResource($tx),
            message: 'Phê duyệt phiếu thu/chi thành công'
        );
    }

    public function post(string $id): JsonResponse
    {
        if (!Gate::allows('FINANCE.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền ghi sổ quỹ tiền mặt', status: 403);
        }

        $tx = $this->cashService->postTransaction($id);

        return ApiResponse::success(
            data: new CashTransactionResource($tx),
            message: 'Ghi sổ quỹ tiền mặt và cập nhật số dư thành công'
        );
    }
}
