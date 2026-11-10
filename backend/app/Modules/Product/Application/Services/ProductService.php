<?php

namespace Modules\Product\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Agriculture\Application\Services\LotService;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Product\Application\DTOs\AttachProductLotDTO;
use Modules\Product\Application\DTOs\CreateProductDTO;
use Modules\Product\Application\DTOs\UpdateProductDTO;
use Modules\Product\Domain\Entities\Product;
use Modules\Product\Infrastructure\Persistence\Models\ProductLotModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;

class ProductService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly LotService $lotService,
        private readonly AuditService $auditService
    ) {}

    public function listProducts(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = ProductModel::with('cooperative');

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
            $search = '%'.trim($filters['search']).'%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('product_code', $likeOp, $search)
                    ->orWhere('product_name', $likeOp, $search)
                    ->orWhere('category', $likeOp, $search);
            });
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['created_at', 'product_code', 'product_name', 'category', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getProductById(string $id): ProductModel
    {
        $query = ProductModel::with(['cooperative', 'lots']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $product = $query->where('id', $id)->first();

        if (!$product) {
            throw new DomainException('Sản phẩm không tồn tại trong hệ thống', 'PRODUCT_NOT_FOUND', null, 404);
        }

        return $product;
    }

    public function createProduct(CreateProductDTO $dto): ProductModel
    {
        $coopId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($coopId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi tạo sản phẩm', 'TENANT_REQUIRED', null, 400);
        }

        $domainEntity = new Product(
            id: (string) Str::uuid(),
            cooperativeId: $coopId,
            productCode: $dto->productCode,
            productName: $dto->productName,
            category: $dto->category,
            specification: $dto->specification,
            brand: $dto->brand,
            qualityInformation: $dto->qualityInformation,
            status: 'ACTIVE'
        );

        $exists = ProductModel::where('cooperative_id', $coopId)
            ->where('product_code', $domainEntity->productCode)
            ->exists();

        if ($exists) {
            throw new DomainException("Mã sản phẩm [{$domainEntity->productCode}] đã tồn tại trong Hợp tác xã", 'DUPLICATE_PRODUCT_CODE', null, 409);
        }

        $product = ProductModel::create([
            'id' => $domainEntity->id,
            'cooperative_id' => $domainEntity->cooperativeId,
            'product_code' => $domainEntity->productCode,
            'product_name' => $domainEntity->productName,
            'category' => $domainEntity->category,
            'specification' => $domainEntity->specification,
            'brand' => $domainEntity->brand,
            'quality_information' => $domainEntity->qualityInformation,
            'status' => $domainEntity->status,
        ]);

        $this->auditService->log(
            action: 'PRODUCT_CREATED',
            entityType: 'Product',
            entityId: $product->id,
            after: $product->toArray(),
            cooperativeId: $coopId
        );

        return $product->load('cooperative');
    }

    public function updateProduct(string $id, UpdateProductDTO $dto): ProductModel
    {
        $product = $this->getProductById($id);
        $before = $product->toArray();

        $updates = [];
        if ($dto->productName !== null) {
            $updates['product_name'] = $dto->productName;
        }
        if ($dto->category !== null) {
            $updates['category'] = $dto->category;
        }
        if ($dto->specification !== null) {
            $updates['specification'] = $dto->specification;
        }
        if ($dto->brand !== null) {
            $updates['brand'] = $dto->brand;
        }
        if ($dto->qualityInformation !== null) {
            $updates['quality_information'] = $dto->qualityInformation;
        }
        if ($dto->status !== null) {
            $updates['status'] = $dto->status;
        }

        if (!empty($updates)) {
            $product->update($updates);

            $this->auditService->log(
                action: 'PRODUCT_UPDATED',
                entityType: 'Product',
                entityId: $product->id,
                before: $before,
                after: $product->toArray(),
                cooperativeId: $product->cooperative_id
            );
        }

        return $product->fresh(['cooperative', 'lots']);
    }

    public function attachLot(AttachProductLotDTO $dto): void
    {
        $product = $this->getProductById($dto->productId);
        $lot = $this->lotService->getLotById($dto->lotId);

        // Check if already attached
        $exists = ProductLotModel::where('product_id', $product->id)
            ->where('lot_id', $lot->id)
            ->exists();

        if ($exists) {
            throw new DomainException("Lô hàng [{$lot->lot_code}] đã được liên kết với sản phẩm này", 'DUPLICATE_PRODUCT_LOT', null, 409);
        }

        ProductLotModel::create([
            'product_id' => $product->id,
            'lot_id' => $lot->id,
            'quantity' => $dto->quantity ?: (float) $lot->quantity,
            'created_at' => now(),
        ]);

        $this->auditService->log(
            action: 'PRODUCT_LOT_ATTACHED',
            entityType: 'Product',
            entityId: $product->id,
            after: ['product_id' => $product->id, 'lot_id' => $lot->id, 'quantity' => $dto->quantity],
            cooperativeId: $product->cooperative_id
        );
    }

    public function listProductLots(string $productId): Collection
    {
        $product = $this->getProductById($productId);

        return $product->lots;
    }
}
