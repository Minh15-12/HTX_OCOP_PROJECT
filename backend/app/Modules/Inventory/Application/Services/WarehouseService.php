<?php

namespace Modules\Inventory\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Inventory\Infrastructure\Persistence\Models\WarehouseModel;

class WarehouseService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listWarehouses(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = WarehouseModel::with(['cooperative', 'manager'])
            ->withCount(['stockReceipts', 'stockIssues']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('warehouse_code', $likeOp, $search)
                  ->orWhere('name', $likeOp, $search)
                  ->orWhere('location', $likeOp, $search);
            });
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['created_at', 'warehouse_code', 'name', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('warehouse_code', 'asc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getWarehouseById(string $id): WarehouseModel
    {
        $warehouse = WarehouseModel::with(['cooperative', 'manager'])
            ->withCount(['stockReceipts', 'stockIssues'])
            ->find($id);

        if (!$warehouse) {
            throw new DomainException('Kho vật tư không tồn tại trong hệ thống', 'WAREHOUSE_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $warehouse->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập kho của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $warehouse;
    }

    public function createWarehouse(array $data): WarehouseModel
    {
        $coopId = $this->tenantContext->hasTenant() 
            ? $this->tenantContext->getCooperativeId() 
            : ($data['cooperative_id'] ?? null);

        if (!$coopId) {
            throw new DomainException('Không xác định được Hợp tác xã chủ quản', 'MISSING_COOPERATIVE_CONTEXT', null, 400);
        }

        // Invariant: unique warehouse_code per cooperative
        $exists = WarehouseModel::where('cooperative_id', $coopId)
            ->where('warehouse_code', $data['warehouse_code'])
            ->exists();

        if ($exists) {
            throw new DomainException("Mã kho [{$data['warehouse_code']}] đã tồn tại trong Hợp tác xã này", 'DUPLICATE_WAREHOUSE_CODE', null, 409);
        }

        $warehouse = WarehouseModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopId,
            'warehouse_code' => $data['warehouse_code'],
            'name' => $data['name'],
            'location' => $data['location'] ?? null,
            'manager_id' => $data['manager_id'] ?? null,
            'status' => $data['status'] ?? 'ACTIVE',
        ]);

        $this->auditService->log(
            action: 'WAREHOUSE_CREATED',
            entityType: 'Warehouse',
            entityId: $warehouse->id,
            after: $warehouse->toArray(),
            cooperativeId: $coopId
        );

        return $warehouse->load(['cooperative', 'manager']);
    }

    public function updateWarehouse(string $id, array $data): WarehouseModel
    {
        $warehouse = $this->getWarehouseById($id);
        $before = $warehouse->toArray();

        $updatePayload = [];
        if (isset($data['name'])) {
            $updatePayload['name'] = $data['name'];
        }
        if (array_key_exists('location', $data)) {
            $updatePayload['location'] = $data['location'];
        }
        if (array_key_exists('manager_id', $data)) {
            $updatePayload['manager_id'] = $data['manager_id'];
        }
        if (isset($data['status'])) {
            $updatePayload['status'] = $data['status'];
        }

        if (!empty($updatePayload)) {
            $warehouse->update($updatePayload);

            $this->auditService->log(
                action: 'WAREHOUSE_UPDATED',
                entityType: 'Warehouse',
                entityId: $warehouse->id,
                before: $before,
                after: $warehouse->toArray(),
                cooperativeId: $warehouse->cooperative_id
            );
        }

        return $warehouse->fresh(['cooperative', 'manager']);
    }

    public function deleteWarehouse(string $id): void
    {
        $warehouse = $this->getWarehouseById($id);

        // Invariant: Cannot delete warehouse that has active transactions
        $hasReceipts = $warehouse->stockReceipts()->exists();
        $hasIssues = $warehouse->stockIssues()->exists();

        if ($hasReceipts || $hasIssues) {
            throw new DomainException('Không thể xóa kho đã phát sinh giao dịch nhập xuất vật tư', 'WAREHOUSE_HAS_TRANSACTIONS', null, 400);
        }

        $snapshot = $warehouse->toArray();
        $coopId = $warehouse->cooperative_id;

        $warehouse->delete();

        $this->auditService->log(
            action: 'WAREHOUSE_DELETED',
            entityType: 'Warehouse',
            entityId: $id,
            before: $snapshot,
            after: null,
            cooperativeId: $coopId
        );
    }
}
