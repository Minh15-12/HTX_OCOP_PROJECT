<?php

namespace Modules\Inventory\Application\Services;

use Illuminate\Support\Facades\DB;
use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Inventory\Application\DTOs\CreateMaterialDTO;
use Modules\Inventory\Application\DTOs\UpdateMaterialDTO;
use Modules\Inventory\Domain\Entities\Material;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueLineModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockReceiptLineModel;

class MaterialService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listMaterials(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = MaterialModel::with('cooperative');

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('sku', $likeOp, $search)
                  ->orWhere('name', $likeOp, $search)
                  ->orWhere('category', $likeOp, $search);
            });
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['created_at', 'sku', 'name', 'category', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getMaterialById(string $id): MaterialModel
    {
        $query = MaterialModel::with('cooperative');

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $material = $query->where('id', $id)->first();

        if (!$material) {
            throw new DomainException('Vật tư không tồn tại trong hệ thống', 'MATERIAL_NOT_FOUND', null, 404);
        }

        return $material;
    }

    public function calculateAvailableStock(string $materialId): float
    {
        $receiptQty = (float) StockReceiptLineModel::where('material_id', $materialId)
            ->whereHas('stockReceipt', function ($q) {
                $q->where('status', 'APPROVED');
            })
            ->sum('quantity');

        $issueQty = (float) StockIssueLineModel::where('material_id', $materialId)
            ->whereHas('stockIssue', function ($q) {
                $q->where('status', 'APPROVED');
            })
            ->sum('quantity');

        return max(0.0, $receiptQty - $issueQty);
    }

    public function createMaterial(CreateMaterialDTO $dto): MaterialModel
    {
        $coopId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($coopId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi thêm mới vật tư', 'TENANT_REQUIRED', null, 400);
        }

        $domainEntity = new Material(
            id: (string) Str::uuid(),
            cooperativeId: $coopId,
            sku: $dto->sku,
            name: $dto->name,
            category: $dto->category,
            unit: $dto->unit,
            safetyInformation: $dto->safetyInformation,
            reorderThreshold: $dto->reorderThreshold,
            status: 'ACTIVE'
        );

        $exists = MaterialModel::where('cooperative_id', $coopId)
            ->where('sku', $domainEntity->sku)
            ->exists();

        if ($exists) {
            throw new DomainException("Mã SKU vật tư [{$domainEntity->sku}] đã tồn tại trong Hợp tác xã", 'DUPLICATE_MATERIAL_SKU', null, 409);
        }

        $material = MaterialModel::create([
            'id' => $domainEntity->id,
            'cooperative_id' => $domainEntity->cooperativeId,
            'sku' => $domainEntity->sku,
            'name' => $domainEntity->name,
            'category' => $domainEntity->category,
            'unit' => $domainEntity->unit,
            'safety_information' => $domainEntity->safetyInformation,
            'reorder_threshold' => $domainEntity->reorderThreshold,
            'status' => $domainEntity->status,
        ]);

        $this->auditService->log(
            action: 'MATERIAL_CREATED',
            entityType: 'Material',
            entityId: $material->id,
            after: $material->toArray(),
            cooperativeId: $coopId
        );

        return $material->load('cooperative');
    }

    public function updateMaterial(string $id, UpdateMaterialDTO $dto): MaterialModel
    {
        $material = $this->getMaterialById($id);
        $before = $material->toArray();

        $updates = [];
        if ($dto->name !== null) $updates['name'] = $dto->name;
        if ($dto->category !== null) $updates['category'] = $dto->category;
        if ($dto->unit !== null) $updates['unit'] = $dto->unit;
        if ($dto->safetyInformation !== null) $updates['safety_information'] = $dto->safetyInformation;
        if ($dto->reorderThreshold !== null) $updates['reorder_threshold'] = $dto->reorderThreshold;
        if ($dto->status !== null) $updates['status'] = $dto->status;

        if (!empty($updates)) {
            $material->update($updates);

            $this->auditService->log(
                action: 'MATERIAL_UPDATED',
                entityType: 'Material',
                entityId: $material->id,
                before: $before,
                after: $material->toArray(),
                cooperativeId: $material->cooperative_id
            );
        }

        return $material->fresh('cooperative');
    }
}
