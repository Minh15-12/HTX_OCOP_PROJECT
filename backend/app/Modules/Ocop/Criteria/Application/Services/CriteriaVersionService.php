<?php

namespace Modules\Ocop\Criteria\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Criteria\Application\DTOs\CreateCriteriaVersionDTO;
use Modules\Ocop\Criteria\Application\DTOs\UpdateCriteriaVersionDTO;
use Modules\Ocop\Criteria\Domain\Entities\CriteriaVersion;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;

class CriteriaVersionService
{
    public function __construct(
        private readonly AuditService $auditService
    ) {}

    public function listVersions(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = CriteriaVersionModel::query();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('version_code', $likeOp, $search)
                  ->orWhere('name', $likeOp, $search);
            });
        }

        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $allowedSorts = ['created_at', 'version_code', 'name', 'status'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getVersionById(string $id): CriteriaVersionModel
    {
        $version = CriteriaVersionModel::with([
            'groups.criteria.indicators',
            'scoringRules',
            'mandatoryConditions'
        ])->find($id);

        if (!$version) {
            throw new DomainException('Phiên bản bộ tiêu chí không tồn tại trong hệ thống', 'CRITERIA_VERSION_NOT_FOUND', null, 404);
        }

        return $version;
    }

    public function createVersion(CreateCriteriaVersionDTO $dto): CriteriaVersionModel
    {
        $exists = CriteriaVersionModel::where('version_code', $dto->versionCode)->exists();
        if ($exists) {
            throw new DomainException("Mã phiên bản tiêu chí [{$dto->versionCode}] đã tồn tại trong hệ thống", 'DUPLICATE_VERSION_CODE', null, 409);
        }

        $domainEntity = new CriteriaVersion(
            id: (string) Str::uuid(),
            versionCode: $dto->versionCode,
            name: $dto->name,
            effectiveFrom: $dto->effectiveFrom,
            effectiveTo: $dto->effectiveTo,
            sourceReference: $dto->sourceReference,
            status: 'DRAFT'
        );

        $version = CriteriaVersionModel::create([
            'id' => $domainEntity->id,
            'version_code' => $domainEntity->versionCode,
            'name' => $domainEntity->name,
            'effective_from' => $domainEntity->effectiveFrom,
            'effective_to' => $domainEntity->effectiveTo,
            'source_reference' => $domainEntity->sourceReference,
            'status' => $domainEntity->status,
        ]);

        $this->auditService->log(
            action: 'CRITERIA_VERSION_CREATED',
            entityType: 'CriteriaVersion',
            entityId: $version->id,
            after: $version->toArray()
        );

        return $version->load(['groups.criteria.indicators', 'scoringRules', 'mandatoryConditions']);
    }

    public function updateVersion(string $id, UpdateCriteriaVersionDTO $dto): CriteriaVersionModel
    {
        $version = $this->getVersionById($id);
        $before = $version->toArray();

        $domainEntity = new CriteriaVersion(
            id: $version->id,
            versionCode: $version->version_code,
            name: $version->name,
            effectiveFrom: $version->effective_from?->format('Y-m-d'),
            effectiveTo: $version->effective_to?->format('Y-m-d'),
            sourceReference: $version->source_reference,
            status: $version->status
        );

        // Invariant check: Published versions cannot be modified
        $domainEntity->assertEditable();

        $updates = [];
        if ($dto->name !== null) $updates['name'] = $dto->name;
        if ($dto->effectiveFrom !== null) $updates['effective_from'] = $dto->effectiveFrom;
        if ($dto->effectiveTo !== null) $updates['effective_to'] = $dto->effectiveTo;
        if ($dto->sourceReference !== null) $updates['source_reference'] = $dto->sourceReference;

        if (!empty($updates)) {
            $version->update($updates);

            $this->auditService->log(
                action: 'CRITERIA_VERSION_UPDATED',
                entityType: 'CriteriaVersion',
                entityId: $version->id,
                before: $before,
                after: $version->toArray()
            );
        }

        return $version->fresh(['groups.criteria.indicators', 'scoringRules', 'mandatoryConditions']);
    }

    public function publishVersion(string $id): CriteriaVersionModel
    {
        $version = $this->getVersionById($id);

        $domainEntity = new CriteriaVersion(
            id: $version->id,
            versionCode: $version->version_code,
            name: $version->name,
            effectiveFrom: $version->effective_from?->format('Y-m-d'),
            effectiveTo: $version->effective_to?->format('Y-m-d'),
            sourceReference: $version->source_reference,
            status: $version->status
        );

        // Sum max_score of all indicators across all criteria and groups
        $totalScore = 0.0;
        foreach ($version->groups as $group) {
            foreach ($group->criteria as $criterion) {
                foreach ($criterion->indicators as $indicator) {
                    $totalScore += (float) $indicator->max_score;
                }
            }
        }

        // Domain publish validation (checks draft status + totalScore == 100.00)
        $domainEntity->publish($totalScore);

        $version->update([
            'status' => $domainEntity->status,
        ]);

        $this->auditService->log(
            action: 'CRITERIA_VERSION_PUBLISHED',
            entityType: 'CriteriaVersion',
            entityId: $version->id,
            after: $version->toArray()
        );

        return $version->fresh(['groups.criteria.indicators', 'scoringRules', 'mandatoryConditions']);
    }
}
