<?php

namespace Modules\Ocop\Evidence\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Dossier\Domain\Entities\OcopApplication;
use Modules\Ocop\Evidence\Application\DTOs\LinkEvidenceDTO;
use Modules\Ocop\Evidence\Domain\Entities\EvidenceLink;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceLinkModel;

class EvidenceLinkService
{
    public function __construct(
        private readonly EvidenceVersionService $versionService,
        private readonly AuditService $auditService
    ) {}

    public function linkToIndicator(LinkEvidenceDTO $dto): EvidenceLinkModel
    {
        $evidence = $this->versionService->getEvidenceById($dto->evidenceId);
        $app = $evidence->application;

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

        $domainLink = new EvidenceLink(
            evidenceId: $evidence->id,
            indicatorId: $indicator->id,
            relevance: $dto->relevance,
            note: $dto->note,
            createdBy: auth()->check() ? auth()->id() : 'SYSTEM'
        );

        $link = EvidenceLinkModel::updateOrCreate(
            [
                'evidence_id' => $domainLink->evidenceId,
                'indicator_id' => $domainLink->indicatorId,
            ],
            [
                'relevance' => $domainLink->relevance,
                'note' => $domainLink->note,
                'created_by' => $domainLink->createdBy,
                'created_at' => now(),
            ]
        );

        $this->auditService->log(
            action: 'EVIDENCE_LINKED',
            entityType: 'EvidenceLink',
            entityId: "{$evidence->id}:{$indicator->id}",
            after: $link->toArray(),
            cooperativeId: $app->cooperative_id
        );

        return $link->load(['evidence', 'indicator']);
    }

    public function unlinkFromIndicator(string $evidenceId, string $indicatorId): bool
    {
        $evidence = $this->versionService->getEvidenceById($evidenceId);
        $app = $evidence->application;

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

        $deleted = EvidenceLinkModel::where('evidence_id', $evidenceId)
            ->where('indicator_id', $indicatorId)
            ->delete();

        if ($deleted) {
            $this->auditService->log(
                action: 'EVIDENCE_UNLINKED',
                entityType: 'EvidenceLink',
                entityId: "{$evidenceId}:{$indicatorId}",
                cooperativeId: $app->cooperative_id
            );
        }

        return (bool) $deleted;
    }
}
