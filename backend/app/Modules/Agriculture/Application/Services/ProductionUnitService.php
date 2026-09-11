<?php

namespace Modules\Agriculture\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\DTOs\CreateProductionUnitDTO;
use Modules\Agriculture\Application\DTOs\UpdateProductionUnitDTO;
use Modules\Agriculture\Domain\Entities\ProductionUnit;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;

class ProductionUnitService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listProductionUnits(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = ProductionUnitModel::with(['cooperative', 'plots']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';

        if (!empty($filters['crop'])) {
            $query->where('crop', $likeOp, '%' . trim($filters['crop']) . '%');
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('unit_code', $likeOp, $search)
                  ->orWhere('name', $likeOp, $search)
                  ->orWhere('crop', $likeOp, $search);
            });
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['created_at', 'unit_code', 'name', 'area', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getProductionUnitById(string $id): ProductionUnitModel
    {
        $query = ProductionUnitModel::with(['cooperative', 'plots']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $unit = $query->where('id', $id)->first();

        if (!$unit) {
            throw new DomainException('Vùng sản xuất không tồn tại hoặc thuộc Hợp tác xã khác', 'PRODUCTION_UNIT_NOT_FOUND', null, 404);
        }

        return $unit;
    }

    public function createProductionUnit(CreateProductionUnitDTO $dto): ProductionUnitModel
    {
        $cooperativeId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($cooperativeId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi tạo Vùng sản xuất', 'TENANT_REQUIRED', null, 400);
        }

        // Domain Invariant Area > 0
        $domainEntity = new ProductionUnit(
            id: (string) Str::uuid(),
            cooperativeId: $cooperativeId,
            unitCode: $dto->unitCode,
            name: $dto->name,
            crop: $dto->crop,
            area: $dto->area,
            location: $dto->location,
            status: 'ACTIVE',
            registrationInformation: $dto->registrationInformation
        );

        // Unique unit_code per cooperative
        $exists = ProductionUnitModel::where('cooperative_id', $cooperativeId)
            ->where('unit_code', $domainEntity->unitCode)
            ->exists();

        if ($exists) {
            throw new DomainException("Mã vùng sản xuất [{$domainEntity->unitCode}] đã tồn tại trong Hợp tác xã", 'DUPLICATE_UNIT_CODE', null, 409);
        }

        $unit = ProductionUnitModel::create([
            'id' => $domainEntity->id,
            'cooperative_id' => $domainEntity->cooperativeId,
            'unit_code' => $domainEntity->unitCode,
            'name' => $domainEntity->name,
            'crop' => $domainEntity->crop,
            'area' => $domainEntity->area,
            'location' => $domainEntity->location,
            'status' => $domainEntity->status,
            'registration_information' => $domainEntity->registrationInformation,
        ]);

        $this->auditService->log(
            action: 'PRODUCTION_UNIT_CREATED',
            entityType: 'ProductionUnit',
            entityId: $unit->id,
            after: $unit->toArray(),
            cooperativeId: $cooperativeId
        );

        return $unit->load(['cooperative', 'plots']);
    }

    public function updateProductionUnit(string $id, UpdateProductionUnitDTO $dto): ProductionUnitModel
    {
        $unit = $this->getProductionUnitById($id);
        $before = $unit->toArray();

        $updates = [];
        if ($dto->name !== null) $updates['name'] = $dto->name;
        if ($dto->crop !== null) $updates['crop'] = $dto->crop;
        if ($dto->area !== null) {
            if ($dto->area <= 0) {
                throw new DomainException('Diện tích phải lớn hơn 0', 'INVALID_AREA', null, 400);
            }
            $updates['area'] = $dto->area;
        }
        if ($dto->location !== null) $updates['location'] = $dto->location;
        if ($dto->status !== null) $updates['status'] = $dto->status;
        if ($dto->registrationInformation !== null) $updates['registration_information'] = $dto->registrationInformation;

        if (!empty($updates)) {
            $unit->update($updates);

            $this->auditService->log(
                action: 'PRODUCTION_UNIT_UPDATED',
                entityType: 'ProductionUnit',
                entityId: $unit->id,
                before: $before,
                after: $unit->toArray(),
                cooperativeId: $unit->cooperative_id
            );
        }

        return $unit->fresh(['cooperative', 'plots']);
    }
}
