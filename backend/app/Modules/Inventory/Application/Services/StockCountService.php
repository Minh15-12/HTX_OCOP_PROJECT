<?php

namespace Modules\Inventory\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Inventory\Application\DTOs\CreateStockCountDTO;
use Modules\Inventory\Domain\Entities\StockCount;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockCountLineModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockCountModel;

class StockCountService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly MaterialService $materialService,
        private readonly AuditService $auditService
    ) {}

    public function listCounts(array $filters = [], int $perPage = 15, string $sort = '-count_date'): LengthAwarePaginator
    {
        $query = StockCountModel::with(['cooperative', 'creator', 'approver', 'lines.material']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where('count_number', $likeOp, $search);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['count_date', 'created_at', 'count_number', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('count_date', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getCountById(string $id): StockCountModel
    {
        $query = StockCountModel::with(['cooperative', 'creator', 'approver', 'lines.material']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $count = $query->where('id', $id)->first();

        if (!$count) {
            throw new DomainException('Phiếu kiểm kê kho không tồn tại trong hệ thống', 'STOCK_COUNT_NOT_FOUND', null, 404);
        }

        return $count;
    }

    public function createCount(CreateStockCountDTO $dto): StockCountModel
    {
        $coopId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($coopId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi tạo phiếu kiểm kê', 'TENANT_REQUIRED', null, 400);
        }

        if (empty($dto->lines)) {
            throw new DomainException('Phiếu kiểm kê kho phải chứa ít nhất 1 dòng vật tư', 'EMPTY_COUNT_LINES', null, 400);
        }

        $countNumber = $dto->customCountNumber ?: strtoupper('PKK-' . now()->format('Ymd') . '-' . Str::random(4));

        $exists = StockCountModel::where('count_number', $countNumber)->exists();
        if ($exists) {
            throw new DomainException("Mã phiếu kiểm kê kho [{$countNumber}] đã tồn tại", 'DUPLICATE_COUNT_NUMBER', null, 409);
        }

        return DB::transaction(function () use ($dto, $coopId, $countNumber) {
            $linesToInsert = [];

            foreach ($dto->lines as $lineDto) {
                if ($lineDto->actualQuantity < 0) {
                    throw new DomainException('Số lượng kiểm kê thực tế không được âm', 'INVALID_COUNT_QUANTITY', null, 400);
                }

                $material = MaterialModel::where('cooperative_id', $coopId)
                    ->where('id', $lineDto->materialId)
                    ->first();

                if (!$material) {
                    throw new DomainException("Vật tư [{$lineDto->materialId}] không tồn tại trong HTX", 'MATERIAL_NOT_FOUND', null, 404);
                }

                $expectedQuantity = $this->materialService->calculateAvailableStock($material->id);
                $difference = $lineDto->actualQuantity - $expectedQuantity;

                $linesToInsert[] = [
                    'id' => (string) Str::uuid(),
                    'material_id' => $material->id,
                    'expected_quantity' => $expectedQuantity,
                    'actual_quantity' => $lineDto->actualQuantity,
                    'difference' => $difference,
                    'reason' => $lineDto->reason,
                ];
            }

            $count = StockCountModel::create([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'count_number' => $countNumber,
                'count_date' => $dto->countDate,
                'scope' => $dto->scope,
                'status' => 'DRAFT',
                'reason' => $dto->reason,
                'created_by' => auth()->check() ? auth()->id() : null,
            ]);

            foreach ($linesToInsert as $line) {
                $line['stock_count_id'] = $count->id;
                StockCountLineModel::create($line);
            }

            $this->auditService->log(
                action: 'STOCK_COUNT_CREATED',
                entityType: 'StockCount',
                entityId: $count->id,
                after: $count->toArray(),
                cooperativeId: $coopId
            );

            return $count->load(['lines.material', 'creator']);
        });
    }

    public function completeCount(string $id): StockCountModel
    {
        $count = $this->getCountById($id);

        $domainEntity = new StockCount(
            id: $count->id,
            cooperativeId: $count->cooperative_id,
            countNumber: $count->count_number,
            countDate: $count->count_date->format('Y-m-d'),
            status: $count->status
        );

        $domainEntity->complete();
        $count->update(['status' => $domainEntity->status]);

        $this->auditService->log(
            action: 'STOCK_COUNT_COMPLETED',
            entityType: 'StockCount',
            entityId: $count->id,
            after: $count->toArray(),
            cooperativeId: $count->cooperative_id
        );

        return $count->fresh(['lines.material', 'creator']);
    }

    public function approveCount(string $id): StockCountModel
    {
        $count = $this->getCountById($id);

        if ($count->status === 'APPROVED') {
            return $count;
        }

        $domainEntity = new StockCount(
            id: $count->id,
            cooperativeId: $count->cooperative_id,
            countNumber: $count->count_number,
            countDate: $count->count_date->format('Y-m-d'),
            status: $count->status
        );

        $approverId = auth()->check() ? auth()->id() : null;
        $domainEntity->approve($approverId ?: 'SYSTEM');

        $count->update([
            'status' => $domainEntity->status,
            'approved_by' => $approverId,
        ]);

        $this->auditService->log(
            action: 'STOCK_COUNT_APPROVED',
            entityType: 'StockCount',
            entityId: $count->id,
            after: $count->toArray(),
            cooperativeId: $count->cooperative_id
        );

        return $count->fresh(['lines.material', 'creator', 'approver']);
    }
}
