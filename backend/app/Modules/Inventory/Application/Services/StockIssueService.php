<?php

namespace Modules\Inventory\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Inventory\Application\DTOs\CreateStockIssueDTO;
use Modules\Inventory\Domain\Entities\StockIssue;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueLineModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueModel;

class StockIssueService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly MaterialService $materialService,
        private readonly AuditService $auditService
    ) {}

    public function listIssues(array $filters = [], int $perPage = 15, string $sort = '-issue_date'): LengthAwarePaginator
    {
        $query = StockIssueModel::with(['cooperative', 'member', 'creator', 'approver', 'lines.material']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where('issue_number', $likeOp, $search);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['issue_date', 'created_at', 'issue_number', 'total_amount', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('issue_date', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getIssueById(string $id): StockIssueModel
    {
        $query = StockIssueModel::with(['cooperative', 'member', 'creator', 'approver', 'lines.material']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $issue = $query->where('id', $id)->first();

        if (!$issue) {
            throw new DomainException('Phiếu xuất kho không tồn tại trong hệ thống', 'STOCK_ISSUE_NOT_FOUND', null, 404);
        }

        return $issue;
    }

    public function createIssue(CreateStockIssueDTO $dto): StockIssueModel
    {
        $coopId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($coopId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi tạo phiếu xuất kho', 'TENANT_REQUIRED', null, 400);
        }

        if (empty($dto->lines)) {
            throw new DomainException('Phiếu xuất kho phải chứa ít nhất 1 dòng vật tư', 'EMPTY_ISSUE_LINES', null, 400);
        }

        $issueNumber = $dto->customIssueNumber ?: strtoupper('PXK-' . now()->format('Ymd') . '-' . Str::random(4));

        $exists = StockIssueModel::where('issue_number', $issueNumber)->exists();
        if ($exists) {
            throw new DomainException("Mã phiếu xuất kho [{$issueNumber}] đã tồn tại", 'DUPLICATE_ISSUE_NUMBER', null, 409);
        }

        return DB::transaction(function () use ($dto, $coopId, $issueNumber) {
            $totalAmount = 0.0;
            $linesToInsert = [];

            foreach ($dto->lines as $lineDto) {
                if ($lineDto->quantity <= 0) {
                    throw new DomainException('Số lượng xuất phải lớn hơn 0', 'INVALID_LINE_QUANTITY', null, 400);
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
                    'line_amount' => $lineAmount,
                ];
            }

            $issue = StockIssueModel::create([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'issue_number' => $issueNumber,
                'issue_date' => $dto->issueDate,
                'member_id' => $dto->memberId,
                'purpose' => $dto->purpose,
                'status' => 'DRAFT',
                'total_amount' => $totalAmount,
                'created_by' => auth()->check() ? auth()->id() : null,
            ]);

            foreach ($linesToInsert as $line) {
                $line['stock_issue_id'] = $issue->id;
                StockIssueLineModel::create($line);
            }

            $this->auditService->log(
                action: 'STOCK_ISSUE_CREATED',
                entityType: 'StockIssue',
                entityId: $issue->id,
                after: $issue->toArray(),
                cooperativeId: $coopId
            );

            return $issue->load(['lines.material', 'creator', 'member']);
        });
    }

    public function submitIssue(string $id): StockIssueModel
    {
        $issue = $this->getIssueById($id);

        $domainEntity = new StockIssue(
            id: $issue->id,
            cooperativeId: $issue->cooperative_id,
            issueNumber: $issue->issue_number,
            issueDate: $issue->issue_date->format('Y-m-d'),
            status: $issue->status
        );

        $domainEntity->submit();
        $issue->update(['status' => $domainEntity->status]);

        $this->auditService->log(
            action: 'STOCK_ISSUE_SUBMITTED',
            entityType: 'StockIssue',
            entityId: $issue->id,
            after: $issue->toArray(),
            cooperativeId: $issue->cooperative_id
        );

        return $issue->fresh(['lines.material', 'creator', 'member']);
    }

    public function approveIssue(string $id): StockIssueModel
    {
        $issue = $this->getIssueById($id);

        if ($issue->status === 'APPROVED') {
            return $issue; // Idempotent approval
        }

        $domainEntity = new StockIssue(
            id: $issue->id,
            cooperativeId: $issue->cooperative_id,
            issueNumber: $issue->issue_number,
            issueDate: $issue->issue_date->format('Y-m-d'),
            status: $issue->status
        );

        $approverId = auth()->check() ? auth()->id() : null;
        $domainEntity->approve($approverId ?: 'SYSTEM');

        return DB::transaction(function () use ($issue, $domainEntity, $approverId) {
            // Lock materials for update to prevent concurrent stock depletion
            foreach ($issue->lines as $line) {
                $mat = MaterialModel::where('id', $line->material_id)->lockForUpdate()->first();

                $availableStock = $this->materialService->calculateAvailableStock($line->material_id);
                if ($availableStock < (float) $line->quantity) {
                    throw new DomainException(
                        "Tồn kho khả dụng của vật tư [{$mat->name} ({$mat->sku})] không đủ để xuất! Khả dụng: {$availableStock} {$mat->unit}, Yêu cầu xuất: {$line->quantity} {$mat->unit}",
                        'INSUFFICIENT_STOCK',
                        null,
                        400
                    );
                }
            }

            $issue->update([
                'status' => $domainEntity->status,
                'approved_by' => $approverId,
            ]);

            $this->auditService->log(
                action: 'STOCK_ISSUE_APPROVED',
                entityType: 'StockIssue',
                entityId: $issue->id,
                after: $issue->toArray(),
                cooperativeId: $issue->cooperative_id
            );

            return $issue->fresh(['lines.material', 'creator', 'approver', 'member']);
        });
    }
}
