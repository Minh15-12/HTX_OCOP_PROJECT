<?php

namespace Modules\Inventory\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Inventory\Application\DTOs\CreateStockIssueDTO;
use Modules\Inventory\Application\DTOs\StockIssueLineDTO;
use Modules\Inventory\Application\Services\StockIssueService;
use Modules\Inventory\Presentation\Http\Requests\CreateStockIssueRequest;
use Modules\Inventory\Presentation\Http\Resources\StockIssueResource;

class StockIssueController extends BaseController
{
    public function __construct(private readonly StockIssueService $issueService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem phiếu xuất kho', status: 403);
        }

        $filters = $request->only(['status', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-issue_date');

        $paginator = $this->issueService->listIssues($filters, $perPage, $sort);

        return ApiResponse::success(
            data: StockIssueResource::collection($paginator->items()),
            message: 'Lấy danh sách phiếu xuất kho thành công',
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
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết phiếu xuất kho', status: 403);
        }

        $issue = $this->issueService->getIssueById($id);

        return ApiResponse::success(
            data: new StockIssueResource($issue),
            message: 'Lấy chi tiết phiếu xuất kho thành công'
        );
    }

    public function store(CreateStockIssueRequest $request): JsonResponse
    {
        if (!Gate::allows('INVENTORY.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền lập phiếu xuất kho mới', status: 403);
        }

        $lineDtos = [];
        foreach ($request->input('lines') as $line) {
            $lineDtos[] = new StockIssueLineDTO(
                materialId: $line['material_id'],
                quantity: (float) $line['quantity'],
                unitPrice: isset($line['unit_price']) ? (float) $line['unit_price'] : 0.0,
                batchCode: $line['batch_code'] ?? null
            );
        }

        $dto = new CreateStockIssueDTO(
            issueDate: $request->input('issue_date'),
            lines: $lineDtos,
            memberId: $request->input('member_id'),
            cropSeasonId: $request->input('crop_season_id'),
            purpose: $request->input('purpose'),
            customIssueNumber: $request->input('custom_issue_number'),
            cooperativeId: $request->input('cooperative_id'),
            isCredit: (bool) $request->input('is_credit', false)
        );

        $issue = $this->issueService->createIssue($dto);

        return ApiResponse::success(
            data: new StockIssueResource($issue),
            message: 'Khởi tạo phiếu xuất kho thành công',
            status: 201
        );
    }

    public function submit(string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền gửi duyệt phiếu xuất kho', status: 403);
        }

        $issue = $this->issueService->submitIssue($id);

        return ApiResponse::success(
            data: new StockIssueResource($issue),
            message: 'Gửi duyệt phiếu xuất kho thành công'
        );
    }

    public function approve(string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phê duyệt phiếu xuất kho', status: 403);
        }

        $issue = $this->issueService->approveIssue($id);

        return ApiResponse::success(
            data: new StockIssueResource($issue),
            message: 'Phê duyệt phiếu xuất kho và trừ tồn khả dụng thành công'
        );
    }

    public function printVoucher02(string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chứng từ phiếu xuất kho', status: 403);
        }

        $voucherData = $this->issueService->getVoucher02Data($id);

        return ApiResponse::success(
            data: $voucherData,
            message: 'Tải dữ liệu Phiếu xuất kho Mẫu 02-VT thành công'
        );
    }

    public function returnPackaging(Request $request, string $id): JsonResponse
    {
        if (!Gate::allows('INVENTORY.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền ghi nhận thu hồi vỏ bao bì', status: 403);
        }

        $request->validate([
            'returned_count' => 'required|integer|min:1',
            'proof_photo_url' => 'nullable|string|max:1000',
        ]);

        $issue = $this->issueService->recordPackagingReturn(
            $id,
            (int) $request->input('returned_count'),
            $request->input('proof_photo_url')
        );

        return ApiResponse::success(
            data: new StockIssueResource($issue),
            message: 'Ghi nhận thu hồi vỏ bao bì thuốc BVTV thành công'
        );
    }
}
