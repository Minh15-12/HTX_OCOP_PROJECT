<?php

namespace Modules\Ocop\Evidence\Application\Services;

use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Evidence\Application\DTOs\VerifyEvidenceDTO;
use Modules\Ocop\Evidence\Domain\Entities\Evidence;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;

class EvidenceVerificationService
{
    public function __construct(
        private readonly EvidenceVersionService $versionService,
        private readonly AuditService $auditService
    ) {}

    public function verifyOrReject(VerifyEvidenceDTO $dto): EvidenceModel
    {
        $evidence = $this->versionService->getEvidenceById($dto->evidenceId);
        $before = $evidence->toArray();

        $domainEntity = new Evidence(
            id: $evidence->id,
            applicationId: $evidence->application_id,
            title: $evidence->title,
            evidenceType: $evidence->evidence_type,
            sourceType: $evidence->source_type,
            status: $evidence->status,
            currentVersionId: $evidence->current_version_id,
            verifiedBy: $evidence->verified_by,
            verifiedAt: $evidence->verified_at?->toIso8601String()
        );

        $verifierId = auth()->check() ? auth()->id() : 'SYSTEM';

        if ($dto->status === 'VERIFIED') {
            $domainEntity->verify($verifierId);
            $action = 'EVIDENCE_VERIFIED';
        } else {
            $domainEntity->reject($verifierId, $dto->reason ?? '');
            $action = 'EVIDENCE_REJECTED';
        }

        $evidence->update([
            'status' => $domainEntity->status,
            'verified_by' => $domainEntity->verifiedBy,
            'verified_at' => $domainEntity->verifiedAt,
        ]);

        $this->auditService->log(
            action: $action,
            entityType: 'Evidence',
            entityId: $evidence->id,
            before: $before,
            after: array_merge($evidence->toArray(), ['reason' => $dto->reason]),
            cooperativeId: $evidence->application->cooperative_id
        );

        return $evidence->fresh(['currentVersion', 'verifiedUser', 'indicators']);
    }
}
