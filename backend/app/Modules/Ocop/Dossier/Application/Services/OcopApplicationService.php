<?php

namespace Modules\Ocop\Dossier\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Dossier\Application\DTOs\CreateOcopApplicationDTO;
use Modules\Ocop\Dossier\Application\DTOs\UpdateOcopApplicationDTO;
use Modules\Ocop\Dossier\Domain\Entities\OcopApplication;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;

class OcopApplicationService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listApplications(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = OcopApplicationModel::with(['cooperative', 'product', 'criteriaVersion']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (!empty($filters['criteria_version_id'])) {
            $query->where('criteria_version_id', $filters['criteria_version_id']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where('application_number', $likeOp, $search);
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['created_at', 'application_number', 'status', 'submitted_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getApplicationById(string $id): OcopApplicationModel
    {
        $app = OcopApplicationModel::with([
            'cooperative',
            'product',
            'criteriaVersion.groups.criteria.indicators',
            'selfAssessments.indicator',
            'reviews.reviewer'
        ])->find($id);

        if (!$app) {
            throw new DomainException('Hồ sơ OCOP không tồn tại trong hệ thống', 'APPLICATION_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $app->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập hồ sơ OCOP của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $app;
    }

    public function createApplication(CreateOcopApplicationDTO $dto): OcopApplicationModel
    {
        $tenantId = $this->tenantContext->getCooperativeId();
        if (empty($tenantId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi khởi tạo hồ sơ OCOP', 'TENANT_REQUIRED', null, 400);
        }

        // Validate Product belongs to current HTX tenant
        $product = ProductModel::find($dto->productId);
        if (!$product || $product->cooperative_id !== $tenantId) {
            throw new DomainException('Sản phẩm không tồn tại hoặc không thuộc Hợp tác xã của bạn', 'PRODUCT_TENANT_MISMATCH', null, 400);
        }

        // Validate CriteriaVersion exists and is PUBLISHED or ACTIVE
        $version = CriteriaVersionModel::find($dto->criteriaVersionId);
        if (!$version || !in_array($version->status, ['PUBLISHED', 'ACTIVE'], true)) {
            throw new DomainException('Phiên bản bộ tiêu chí chưa được phát hành hoặc không hợp lệ', 'CRITERIA_VERSION_NOT_PUBLISHED', null, 400);
        }

        $appNumber = $dto->customApplicationNumber ?: strtoupper('HS-OCOP-' . now()->format('Y') . '-' . Str::random(5));

        $exists = OcopApplicationModel::where('application_number', $appNumber)->exists();
        if ($exists) {
            throw new DomainException("Mã số hồ sơ OCOP [{$appNumber}] đã tồn tại trong hệ thống", 'DUPLICATE_APPLICATION_NUMBER', null, 409);
        }

        $domainEntity = new OcopApplication(
            id: (string) Str::uuid(),
            cooperativeId: $tenantId,
            productId: $product->id,
            criteriaVersionId: $version->id,
            applicationNumber: $appNumber,
            applicationType: $dto->applicationType,
            status: 'DRAFT'
        );

        $app = OcopApplicationModel::create([
            'id' => $domainEntity->id,
            'cooperative_id' => $domainEntity->cooperativeId,
            'product_id' => $domainEntity->productId,
            'criteria_version_id' => $domainEntity->criteriaVersionId,
            'application_number' => $domainEntity->applicationNumber,
            'application_type' => $domainEntity->applicationType,
            'status' => $domainEntity->status,
        ]);

        $this->auditService->log(
            action: 'OCOP_APPLICATION_CREATED',
            entityType: 'OcopApplication',
            entityId: $app->id,
            after: $app->toArray(),
            cooperativeId: $tenantId
        );

        return $app->load(['cooperative', 'product', 'criteriaVersion']);
    }

    public function updateApplication(string $id, UpdateOcopApplicationDTO $dto): OcopApplicationModel
    {
        $app = $this->getApplicationById($id);
        $before = $app->toArray();

        $domainEntity = new OcopApplication(
            id: $app->id,
            cooperativeId: $app->cooperative_id,
            productId: $app->product_id,
            criteriaVersionId: $app->criteria_version_id,
            applicationNumber: $app->application_number,
            applicationType: $app->application_type,
            status: $app->status
        );
        $domainEntity->assertEditable();

        $updates = [];
        if ($dto->applicationType !== null) $updates['application_type'] = $dto->applicationType;

        if (!empty($updates)) {
            $app->update($updates);

            $this->auditService->log(
                action: 'OCOP_APPLICATION_UPDATED',
                entityType: 'OcopApplication',
                entityId: $app->id,
                before: $before,
                after: $app->toArray(),
                cooperativeId: $app->cooperative_id
            );
        }

        return $app->fresh(['cooperative', 'product', 'criteriaVersion']);
    }

    public function markReadyForSubmission(string $id): OcopApplicationModel
    {
        $app = $this->getApplicationById($id);

        $domainEntity = new OcopApplication(
            id: $app->id,
            cooperativeId: $app->cooperative_id,
            productId: $app->product_id,
            criteriaVersionId: $app->criteria_version_id,
            applicationNumber: $app->application_number,
            applicationType: $app->application_type,
            status: $app->status
        );
        $domainEntity->assertEditable();

        $totalIndicators = $this->countTotalIndicatorsInVersion($app->criteria_version_id);
        $assessedIndicators = $app->selfAssessments()->where('status', 'COMPLETED')->count();

        $domainEntity->markReadyForSubmission($totalIndicators, $assessedIndicators);

        $app->update(['status' => $domainEntity->status]);

        $this->auditService->log(
            action: 'OCOP_APPLICATION_READY_FOR_SUBMISSION',
            entityType: 'OcopApplication',
            entityId: $app->id,
            after: $app->toArray(),
            cooperativeId: $app->cooperative_id
        );

        return $app->fresh(['cooperative', 'product', 'criteriaVersion', 'selfAssessments']);
    }

    public function submitApplication(string $id): OcopApplicationModel
    {
        $app = $this->getApplicationById($id);

        $domainEntity = new OcopApplication(
            id: $app->id,
            cooperativeId: $app->cooperative_id,
            productId: $app->product_id,
            criteriaVersionId: $app->criteria_version_id,
            applicationNumber: $app->application_number,
            applicationType: $app->application_type,
            status: $app->status
        );
        $domainEntity->assertEditable();

        $totalIndicators = $this->countTotalIndicatorsInVersion($app->criteria_version_id);
        $assessedIndicators = $app->selfAssessments()->where('status', 'COMPLETED')->count();

        $domainEntity->submit($totalIndicators, $assessedIndicators);

        $app->update([
            'status' => $domainEntity->status,
            'submitted_at' => $domainEntity->submittedAt,
        ]);

        $this->auditService->log(
            action: 'OCOP_APPLICATION_SUBMITTED',
            entityType: 'OcopApplication',
            entityId: $app->id,
            after: $app->toArray(),
            cooperativeId: $app->cooperative_id
        );

        return $app->fresh(['cooperative', 'product', 'criteriaVersion', 'selfAssessments']);
    }

    private function countTotalIndicatorsInVersion(string $versionId): int
    {
        $version = CriteriaVersionModel::with('groups.criteria.indicators')->find($versionId);
        if (!$version) return 0;

        $count = 0;
        foreach ($version->groups as $group) {
            foreach ($group->criteria as $criterion) {
                $count += $criterion->indicators->count();
            }
        }
        return $count;
    }
}
