<?php

namespace Modules\Ocop\Dossier\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Dossier\Application\DTOs\SaveSelfAssessmentDTO;
use Modules\Ocop\Dossier\Domain\Entities\OcopApplication;
use Modules\Ocop\Dossier\Domain\Entities\SelfAssessment;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\SelfAssessmentModel;

class SelfAssessmentService
{
    public function __construct(
        private readonly OcopApplicationService $applicationService,
        private readonly AuditService $auditService
    ) {}

    public function listSelfAssessments(string $applicationId): Collection
    {
        $app = $this->applicationService->getApplicationById($applicationId);

        return SelfAssessmentModel::with('indicator')
            ->where('application_id', $app->id)
            ->get();
    }

    public function saveSelfAssessment(string $applicationId, SaveSelfAssessmentDTO $dto): SelfAssessmentModel
    {
        $app = $this->applicationService->getApplicationById($applicationId);

        $domainApp = new OcopApplication(
            id: $app->id,
            cooperativeId: $app->cooperative_id,
            productId: $app->product_id,
            criteriaVersionId: $app->criteria_version_id,
            applicationNumber: $app->application_number,
            applicationType: $app->application_type,
            status: $app->status
        );
        $domainApp->assertEditable();

        $indicator = IndicatorModel::find($dto->indicatorId);
        if (!$indicator) {
            throw new DomainException('Chỉ tiêu không tồn tại trong hệ thống', 'INDICATOR_NOT_FOUND', null, 404);
        }

        $domainEntity = new SelfAssessment(
            id: (string) Str::uuid(),
            applicationId: $app->id,
            indicatorId: $indicator->id,
            score: $dto->score,
            maxScore: (float) $indicator->max_score,
            explanation: $dto->explanation,
            status: 'COMPLETED'
        );

        $record = SelfAssessmentModel::updateOrCreate(
            [
                'application_id' => $app->id,
                'indicator_id' => $indicator->id,
            ],
            [
                'score' => $domainEntity->score,
                'explanation' => $domainEntity->explanation,
                'status' => $domainEntity->status,
            ]
        );

        // Update application status to SELF_ASSESSING if currently DRAFT
        if ($app->status === 'DRAFT') {
            $domainApp->markSelfAssessing();
            $app->update(['status' => $domainApp->status]);
        }

        $this->auditService->log(
            action: 'SELF_ASSESSMENT_SAVED',
            entityType: 'SelfAssessment',
            entityId: $record->id,
            after: $record->toArray(),
            cooperativeId: $app->cooperative_id
        );

        return $record->load('indicator');
    }
}
