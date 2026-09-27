<?php

namespace Modules\Inventory\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Inventory\Application\DTOs\CreateStockReceiptDTO;
use Modules\Inventory\Domain\Entities\StockReceipt;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockReceiptLineModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockReceiptModel;

class StockReceiptService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listReceipts(array $filters = [], int $perPage = 15, string $sort = '-receipt_date'): LengthAwarePaginator
    {
        $query = StockReceiptModel::with(['cooperative', 'creator', 'approver', 'lines.material']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where('receipt_number', $likeOp, $search);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['receipt_date', 'created_at', 'receipt_number', 'total_amount', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('receipt_date', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getReceiptById(string $id): StockReceiptModel
    {
        $query = StockReceiptModel::with(['cooperative', 'creator', 'approver', 'lines.material']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $receipt = $query->where('id', $id)->first();

        if (!$receipt) {
            throw new DomainException('Phiếu nhập kho không tồn tại trong hệ thống', 'STOCK_RECEIPT_NOT_FOUND', null, 404);
        }

        return $receipt;
    }

    public function createReceipt(CreateStockReceiptDTO $dto): StockReceiptModel
    {
        $coopId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($coopId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi tạo phiếu nhập kho', 'TENANT_REQUIRED', null, 400);
        }

        if (empty($dto->lines)) {
            throw new DomainException('Phiếu nhập kho phải chứa ít nhất 1 dòng vật tư', 'EMPTY_RECEIPT_LINES', null, 400);
        }

        $receiptNumber = $dto->customReceiptNumber ?: strtoupper('PNK-' . now()->format('Ymd') . '-' . Str::random(4));

        $exists = StockReceiptModel::where('receipt_number', $receiptNumber)->exists();
        if ($exists) {
            throw new DomainException("Mã phiếu nhập kho [{$receiptNumber}] đã tồn tại", 'DUPLICATE_RECEIPT_NUMBER', null, 409);
        }

        return DB::transaction(function () use ($dto, $coopId, $receiptNumber) {
            $totalAmount = 0.0;
            $linesToInsert = [];

            foreach ($dto->lines as $lineDto) {
                if ($lineDto->quantity <= 0) {
                    throw new DomainException('Số lượng nhập phải lớn hơn 0', 'INVALID_LINE_QUANTITY', null, 400);
                }

                $material = MaterialModel::where('cooperative_id', $coopId)
                    ->where('id', $lineDto->materialId)
                    ->first();

                if (!$material) {
                    throw new DomainException("Vật tư [{$lineDto->materialId}] không tồn tại trong HTX", 'MATERIAL_NOT_FOUND', null, 404);
                }

                $lineAmount = $lineDto->quantity * $lineDto->unitPrice;
                $totalAmount += $lineAmount;

                $linesToInsert[] = [
                    'id' => (string) Str::uuid(),
                    'material_id' => $material->id,
                    'quantity' => $lineDto->quantity,
                    'unit_price' => $lineDto->unitPrice,
                    'batch_code' => $lineDto->batchCode,
                    'expiry_date' => $lineDto->expiryDate,
                    'line_amount' => $lineAmount,
                ];
            }

            $receipt = StockReceiptModel::create([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'receipt_number' => $receiptNumber,
                'supplier_information' => $dto->supplierInformation,
                'receipt_date' => $dto->receiptDate,
                'status' => 'DRAFT',
                'total_amount' => $totalAmount,
                'evidence_reference' => $dto->evidenceReference,
                'created_by' => auth()->check() ? auth()->id() : null,
            ]);

            foreach ($linesToInsert as $line) {
                $line['stock_receipt_id'] = $receipt->id;
                StockReceiptLineModel::create($line);
            }

            $this->auditService->log(
                action: 'STOCK_RECEIPT_CREATED',
                entityType: 'StockReceipt',
                entityId: $receipt->id,
                after: $receipt->toArray(),
                cooperativeId: $coopId
            );

            return $receipt->load(['lines.material', 'creator']);
        });
    }

    public function submitReceipt(string $id): StockReceiptModel
    {
        $receipt = $this->getReceiptById($id);

        $domainEntity = new StockReceipt(
            id: $receipt->id,
            cooperativeId: $receipt->cooperative_id,
            receiptNumber: $receipt->receipt_number,
            receiptDate: $receipt->receipt_date->format('Y-m-d'),
            status: $receipt->status
        );

        $domainEntity->submit();
        $receipt->update(['status' => $domainEntity->status]);

        $this->auditService->log(
            action: 'STOCK_RECEIPT_SUBMITTED',
            entityType: 'StockReceipt',
            entityId: $receipt->id,
            after: $receipt->toArray(),
            cooperativeId: $receipt->cooperative_id
        );

        return $receipt->fresh(['lines.material', 'creator']);
    }

    public function approveReceipt(string $id): StockReceiptModel
    {
        $receipt = $this->getReceiptById($id);

        if ($receipt->status === 'APPROVED') {
            return $receipt; // Idempotent approval
        }

        $domainEntity = new StockReceipt(
            id: $receipt->id,
            cooperativeId: $receipt->cooperative_id,
            receiptNumber: $receipt->receipt_number,
            receiptDate: $receipt->receipt_date->format('Y-m-d'),
            status: $receipt->status
        );

        $approverId = auth()->check() ? auth()->id() : null;
        $domainEntity->approve($approverId ?: 'SYSTEM');

        return DB::transaction(function () use ($receipt, $domainEntity, $approverId) {
            $receipt->update([
                'status' => $domainEntity->status,
                'approved_by' => $approverId,
            ]);

            // Create material batch records for FEFO tracking
            foreach ($receipt->lines as $line) {
                $existsBatch = \Modules\Inventory\Infrastructure\Persistence\Models\MaterialBatchModel::where('stock_receipt_line_id', $line->id)->exists();
                if (!$existsBatch) {
                    \Modules\Inventory\Infrastructure\Persistence\Models\MaterialBatchModel::create([
                        'id' => (string) Str::uuid(),
                        'cooperative_id' => $receipt->cooperative_id,
                        'material_id' => $line->material_id,
                        'stock_receipt_line_id' => $line->id,
                        'batch_number' => $line->batch_code ?: ('BATCH-' . strtoupper(Str::random(6))),
                        'quantity' => $line->quantity,
                        'initial_quantity' => $line->quantity,
                        'expired_at' => $line->expiry_date,
                        'status' => 'ACTIVE',
                    ]);
                }
            }

            $this->auditService->log(
                action: 'STOCK_RECEIPT_APPROVED',
                entityType: 'StockReceipt',
                entityId: $receipt->id,
                after: $receipt->toArray(),
                cooperativeId: $receipt->cooperative_id
            );

            return $receipt->fresh(['lines.material', 'creator', 'approver']);
        });
    }
}
