<?php

namespace Modules\Ocop\Criteria\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Criteria\Application\DTOs\CreateCriteriaGroupDTO;
use Modules\Ocop\Criteria\Application\DTOs\CreateCriterionDTO;
use Modules\Ocop\Criteria\Application\DTOs\CreateIndicatorDTO;
use Modules\Ocop\Criteria\Application\DTOs\UpdateIndicatorDTO;
use Modules\Ocop\Criteria\Domain\Entities\CriteriaGroup;
use Modules\Ocop\Criteria\Domain\Entities\CriteriaVersion;
use Modules\Ocop\Criteria\Domain\Entities\Criterion;
use Modules\Ocop\Criteria\Domain\Entities\Indicator;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaGroupModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriterionModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;

class CriteriaTreeService
{
    public function __construct(
        private readonly CriteriaVersionService $versionService,
        private readonly AuditService $auditService
    ) {}

    // --- CRITERIA GROUPS ---

    public function listGroupsByVersion(string $versionId): Collection
    {
        $version = $this->versionService->getVersionById($versionId);
        return CriteriaGroupModel::with('criteria.indicators')
            ->where('criteria_version_id', $version->id)
            ->orderBy('display_order', 'asc')
            ->get();
    }

    public function createGroup(CreateCriteriaGroupDTO $dto): CriteriaGroupModel
    {
        $versionModel = $this->versionService->getVersionById($dto->criteriaVersionId);

        $versionEntity = new CriteriaVersion(
            id: $versionModel->id,
            versionCode: $versionModel->version_code,
            name: $versionModel->name,
            status: $versionModel->status
        );
        $versionEntity->assertEditable();

        $exists = CriteriaGroupModel::where('criteria_version_id', $versionModel->id)
            ->where('code', $dto->code)
            ->exists();

        if ($exists) {
            throw new DomainException("Mã nhóm tiêu chí [{$dto->code}] đã tồn tại trong phiên bản này", 'DUPLICATE_GROUP_CODE', null, 409);
        }

        $groupEntity = new CriteriaGroup(
            id: (string) Str::uuid(),
            criteriaVersionId: $versionModel->id,
            code: $dto->code,
            name: $dto->name,
            description: $dto->description,
            displayOrder: $dto->displayOrder
        );

        $group = CriteriaGroupModel::create([
            'id' => $groupEntity->id,
            'criteria_version_id' => $groupEntity->criteriaVersionId,
            'code' => $groupEntity->code,
            'name' => $groupEntity->name,
            'description' => $groupEntity->description,
            'display_order' => $groupEntity->displayOrder,
        ]);

        $this->auditService->log(
            action: 'CRITERIA_GROUP_CREATED',
            entityType: 'CriteriaGroup',
            entityId: $group->id,
            after: $group->toArray()
        );

        return $group->load('criteria.indicators');
    }

    // --- CRITERIA ---

    public function listCriteriaByGroup(string $groupId): Collection
    {
        $group = CriteriaGroupModel::with('criteria.indicators')->find($groupId);
        if (!$group) {
            throw new DomainException('Nhóm tiêu chí không tồn tại trong hệ thống', 'CRITERIA_GROUP_NOT_FOUND', null, 404);
        }

        return CriterionModel::with('indicators')
            ->where('criteria_group_id', $group->id)
            ->orderBy('display_order', 'asc')
            ->get();
    }

    public function createCriterion(CreateCriterionDTO $dto): CriterionModel
    {
        $group = CriteriaGroupModel::with('version')->find($dto->criteriaGroupId);
        if (!$group) {
            throw new DomainException('Nhóm tiêu chí không tồn tại trong hệ thống', 'CRITERIA_GROUP_NOT_FOUND', null, 404);
        }

        $versionEntity = new CriteriaVersion(
            id: $group->version->id,
            versionCode: $group->version->version_code,
            name: $group->version->name,
            status: $group->version->status
        );
        $versionEntity->assertEditable();

        $criterionEntity = new Criterion(
            id: (string) Str::uuid(),
            criteriaGroupId: $group->id,
            code: $dto->code,
            name: $dto->name,
            description: $dto->description,
            maxScore: $dto->maxScore,
            mandatory: $dto->mandatory,
            displayOrder: $dto->displayOrder
        );

        $criterion = CriterionModel::create([
            'id' => $criterionEntity->id,
            'criteria_group_id' => $criterionEntity->criteriaGroupId,
            'code' => $criterionEntity->code,
            'name' => $criterionEntity->name,
            'description' => $criterionEntity->description,
            'max_score' => $criterionEntity->maxScore,
            'mandatory' => $criterionEntity->mandatory,
            'display_order' => $criterionEntity->displayOrder,
        ]);

        $this->auditService->log(
            action: 'CRITERION_CREATED',
            entityType: 'Criterion',
            entityId: $criterion->id,
            after: $criterion->toArray()
        );

        return $criterion->load('indicators');
    }

    // --- INDICATORS ---

    public function listIndicatorsByCriterion(string $criterionId): Collection
    {
        $criterion = CriterionModel::find($criterionId);
        if (!$criterion) {
            throw new DomainException('Tiêu chí không tồn tại trong hệ thống', 'CRITERION_NOT_FOUND', null, 404);
        }

        return IndicatorModel::where('criterion_id', $criterion->id)
            ->orderBy('display_order', 'asc')
            ->get();
    }

    public function createIndicator(CreateIndicatorDTO $dto): IndicatorModel
    {
        $criterion = CriterionModel::with('group.version')->find($dto->criterionId);
        if (!$criterion) {
            throw new DomainException('Tiêu chí không tồn tại trong hệ thống', 'CRITERION_NOT_FOUND', null, 404);
        }

        $versionEntity = new CriteriaVersion(
            id: $criterion->group->version->id,
            versionCode: $criterion->group->version->version_code,
            name: $criterion->group->version->name,
            status: $criterion->group->version->status
        );
        $versionEntity->assertEditable();

        $exists = IndicatorModel::where('criterion_id', $criterion->id)
            ->where('code', $dto->code)
            ->exists();

        if ($exists) {
            throw new DomainException("Mã chỉ tiêu [{$dto->code}] đã tồn tại trong tiêu chí này", 'DUPLICATE_INDICATOR_CODE', null, 409);
        }

        $indicatorEntity = new Indicator(
            id: (string) Str::uuid(),
            criterionId: $criterion->id,
            code: $dto->code,
            name: $dto->name,
            description: $dto->description,
            maxScore: $dto->maxScore,
            mandatory: $dto->mandatory,
            evidenceRequirement: $dto->evidenceRequirement,
            displayOrder: $dto->displayOrder
        );

        $indicator = IndicatorModel::create([
            'id' => $indicatorEntity->id,
            'criterion_id' => $indicatorEntity->criterionId,
            'code' => $indicatorEntity->code,
            'name' => $indicatorEntity->name,
            'description' => $indicatorEntity->description,
            'max_score' => $indicatorEntity->maxScore,
            'mandatory' => $indicatorEntity->mandatory,
            'evidence_requirement' => $indicatorEntity->evidenceRequirement,
            'display_order' => $indicatorEntity->displayOrder,
        ]);

        $this->auditService->log(
            action: 'INDICATOR_CREATED',
            entityType: 'Indicator',
            entityId: $indicator->id,
            after: $indicator->toArray()
        );

        return $indicator;
    }

    public function updateIndicator(string $id, UpdateIndicatorDTO $dto): IndicatorModel
    {
        $indicator = IndicatorModel::with('criterion.group.version')->find($id);
        if (!$indicator) {
            throw new DomainException('Chỉ tiêu không tồn tại trong hệ thống', 'INDICATOR_NOT_FOUND', null, 404);
        }

        $before = $indicator->toArray();
        $versionEntity = new CriteriaVersion(
            id: $indicator->criterion->group->version->id,
            versionCode: $indicator->criterion->group->version->version_code,
            name: $indicator->criterion->group->version->name,
            status: $indicator->criterion->group->version->status
        );
        $versionEntity->assertEditable();

        $updates = [];
        if ($dto->name !== null) $updates['name'] = $dto->name;
        if ($dto->description !== null) $updates['description'] = $dto->description;
        if ($dto->maxScore !== null) {
            if ($dto->maxScore < 0.0 || $dto->maxScore > 100.0) {
                throw new DomainException('Điểm tối đa của chỉ tiêu phải từ 0 đến 100', 'INVALID_INDICATOR_SCORE', null, 400);
            }
            $updates['max_score'] = $dto->maxScore;
        }
        if ($dto->mandatory !== null) $updates['mandatory'] = $dto->mandatory;
        if ($dto->evidenceRequirement !== null) $updates['evidence_requirement'] = $dto->evidenceRequirement;
        if ($dto->displayOrder !== null) $updates['display_order'] = $dto->displayOrder;

        if (!empty($updates)) {
            $indicator->update($updates);

            $this->auditService->log(
                action: 'INDICATOR_UPDATED',
                entityType: 'Indicator',
                entityId: $indicator->id,
                before: $before,
                after: $indicator->toArray()
            );
        }

        return $indicator->fresh();
    }
}
