<?php

namespace Modules\Ocop\Evaluation\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evaluation\Application\DTOs\ApproveFinalDecisionDTO;
use Modules\Ocop\Evaluation\Application\DTOs\RejectApplicationDTO;
use Modules\Ocop\Evaluation\Domain\Entities\FinalDecision;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\FinalDecisionModel;

class FinalDecisionService
{
    public function __construct(
        private readonly AuditService $auditService
    ) {}

    public function approve(string $applicationId, ApproveFinalDecisionDTO $dto): FinalDecisionModel
    {
        $application = OcopApplicationModel::find($applicationId);
        if (!$application) {
            throw new DomainException(
                "Không tìm thấy hồ sơ OCOP với ID: {$applicationId}",
                'APPLICATION_NOT_FOUND',
                null,
                404
            );
        }

        // Validate via Domain Entity
        $domainDecision = new FinalDecision(
            id: (string) Str::uuid(),
            applicationId: $applicationId,
            decisionNumber: $dto->decisionNumber,
            decisionDate: $dto->decisionDate,
            finalClassification: $dto->finalClassification,
            authorityReference: $dto->authorityReference,
            effectiveDate: $dto->effectiveDate,
            documentReference: $dto->documentReference
        );

        return DB::transaction(function () use ($application, $domainDecision) {
            $decisionModel = FinalDecisionModel::create([
                'id' => $domainDecision->id,
                'application_id' => $domainDecision->applicationId,
                'decision_number' => $domainDecision->decisionNumber,
                'decision_date' => $domainDecision->decisionDate,
                'final_classification' => $domainDecision->finalClassification,
                'authority_reference' => $domainDecision->authorityReference,
                'effective_date' => $domainDecision->effectiveDate,
                'document_reference' => $domainDecision->documentReference,
                'status' => 'ISSUED',
            ]);

            $application->update(['status' => 'APPROVED']);

            $this->auditService->log(
                action: 'OCOP_RESULT_APPROVED',
                entityType: 'FinalDecision',
                entityId: $decisionModel->id,
                after: [
                    'decision_number' => $decisionModel->decision_number,
                    'final_classification' => $decisionModel->final_classification,
                    'expiration_date' => $domainDecision->getExpirationDate(),
                ],
                cooperativeId: $application->cooperative_id
            );

            return $decisionModel->load('application');
        });
    }

    public function reject(string $applicationId, RejectApplicationDTO $dto): FinalDecisionModel
    {
        $application = OcopApplicationModel::find($applicationId);
        if (!$application) {
            throw new DomainException(
                "Không tìm thấy hồ sơ OCOP với ID: {$applicationId}",
                'APPLICATION_NOT_FOUND',
                null,
                404
            );
        }

        return DB::transaction(function () use ($applicationId, $application, $dto) {
            $decisionModel = FinalDecisionModel::create([
                'id' => (string) Str::uuid(),
                'application_id' => $applicationId,
                'decision_number' => $dto->decisionNumber,
                'decision_date' => $dto->decisionDate,
                'final_classification' => 'REJECTED',
                'authority_reference' => $dto->authorityReference,
                'document_reference' => ['reason' => $dto->reason],
                'status' => 'ISSUED',
            ]);

            $application->update(['status' => 'REJECTED']);

            $this->auditService->log(
                action: 'OCOP_RESULT_REJECTED',
                entityType: 'FinalDecision',
                entityId: $decisionModel->id,
                after: [
                    'decision_number' => $decisionModel->decision_number,
                    'reason' => $dto->reason,
                ],
                cooperativeId: $application->cooperative_id
            );

            return $decisionModel->load('application');
        });
    }

    public function getDecision(string $applicationId): FinalDecisionModel
    {
        $decision = FinalDecisionModel::with('application')
            ->where('application_id', $applicationId)
            ->latest('decision_date')
            ->first();

        if (!$decision) {
            throw new DomainException(
                "Chưa có quyết định công nhận cho hồ sơ ID: {$applicationId}",
                'FINAL_DECISION_NOT_FOUND',
                null,
                404
            );
        }

        return $decision;
    }

    public function listDecisions(array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $query = FinalDecisionModel::with(['application.cooperative', 'application.product']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['final_classification'])) {
            $query->where('final_classification', $filters['final_classification']);
        }

        return $query->orderBy('decision_date', 'desc')->get();
    }
}

