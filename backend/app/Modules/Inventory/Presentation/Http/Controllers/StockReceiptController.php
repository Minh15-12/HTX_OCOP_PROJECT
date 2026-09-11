<?php

namespace Modules\Inventory\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Inventory\Application\DTOs\CreateStockReceiptDTO;
use Modules\Inventory\Application\DTOs\StockReceiptLineDTO;
use Modules\Inventory\Application\Services\StockReceiptService;
use Modules\Inventory\Presentation\Http\Requests\CreateStockReceiptRequest;
use Modules\Inventory\Presentation\Http\Resources\StockReceiptResource;

class StockReceiptController extends BaseController
{
    public function __construct(private readonly StockReceiptService $receiptService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem phiếu nhập kho', status: 403);
        }

        $filters = $request->only(['status', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-receipt_date');

        $paginator = $this->receiptService->listReceipts($filters, $perPage, $sort);

        return ApiResponse::success(
            data: StockReceiptResource::collection($paginator->items()),
            message: 'Lấy danh sách phiếu nhập kho thành công',
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
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết phiếu nhập kho', status: 403);
        }

        $receipt = $this->receiptService->getReceiptById($id);

        return ApiResponse::success(
            data: new StockReceiptResource($receipt),
            message: 'Lấy chi tiết phiếu nhập kho thành công'
        );
    }

    public function store(CreateStockReceiptRequest $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền lập phiếu nhập kho mới', status: 403);
        }

        $lineDtos = [];
        foreach ($request->input('lines') as $line) {
            $lineDtos[] = new StockReceiptLineDTO(
                materialId: $line['material_id'],
                quantity: (float) $line['quantity'],
                unitPrice: isset($line['unit_price']) ? (float) $line['unit_price'] : 0.0,
                batchCode: $line['batch_code'] ?? null,
                expiryDate: $line['expiry_date'] ?? null
            );
        }

        $dto = new CreateStockReceiptDTO(
            receiptDate: $request->input('receipt_date'),
            lines: $lineDtos,
            customReceiptNumber: $request->input('custom_receipt_number'),
            supplierInformation: $request->input('supplier_information'),
            evidenceReference: $request->input('evidence_reference'),
            cooperativeId: $request->input('cooperative_id')
        );

        $receipt = $this->receiptService->createReceipt($dto);

        return ApiResponse::success(
            data: new StockReceiptResource($receipt),
            message: 'Khởi tạo phiếu nhập kho thành công',
            status: 201
        );
    }

    public function submit(string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền gửi duyệt phiếu nhập kho', status: 403);
        }

        $receipt = $this->receiptService->submitReceipt($id);

        return ApiResponse::success(
            data: new StockReceiptResource($receipt),
            message: 'Gửi duyệt phiếu nhập kho thành công'
        );
    }

    public function approve(string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phê duyệt phiếu nhập kho', status: 403);
        }

        $receipt = $this->receiptService->approveReceipt($id);

        return ApiResponse::success(
            data: new StockReceiptResource($receipt),
            message: 'Phê duyệt phiếu nhập kho và nhập tồn thành công'
        );
    }
}
