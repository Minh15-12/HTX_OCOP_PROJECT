<?php

namespace Modules\Ocop\Evaluation\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evaluation\Application\DTOs\AssignEvaluatorsDTO;
use Modules\Ocop\Evaluation\Application\DTOs\CreateEvaluationSessionDTO;
use Modules\Ocop\Evaluation\Domain\Entities\EvaluationSession;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluationSessionModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorAssignmentModel;

class EvaluationSessionService
{
    public function __construct(
        private readonly AuditService $auditService
    ) {}

    public function createSession(CreateEvaluationSessionDTO $dto): EvaluationSessionModel
    {
        $application = OcopApplicationModel::find($dto->applicationId);
        if (!$application) {
            throw new DomainException(
                "Không tìm thấy hồ sơ OCOP với ID: {$dto->applicationId}",
                'APPLICATION_NOT_FOUND',
                null,
                404
            );
        }

        $sessionEntity = new EvaluationSession(
            id: (string) Str::uuid(),
            applicationId: $dto->applicationId,
            councilLevelId: $dto->councilLevelId,
            status: 'ASSIGNED'
        );

        $sessionModel = EvaluationSessionModel::create([
            'id' => $sessionEntity->id,
            'application_id' => $sessionEntity->applicationId,
            'council_level_id' => $sessionEntity->councilLevelId,
            'status' => $sessionEntity->status,
        ]);

        $this->auditService->log(
            action: 'EVALUATION_SESSION_CREATED',
            entityType: 'EvaluationSession',
            entityId: $sessionModel->id,
            after: $sessionModel->toArray(),
            cooperativeId: $application->cooperative_id
        );

        return $sessionModel->load(['application', 'councilLevel']);
    }

    public function assignEvaluators(string $sessionId, AssignEvaluatorsDTO $dto): EvaluationSessionModel
    {
        $session = EvaluationSessionModel::with('application')->find($sessionId);
        if (!$session) {
            throw new DomainException(
                "Không tìm thấy phiên họp đánh giá với ID: {$sessionId}",
                'EVALUATION_SESSION_NOT_FOUND',
                null,
                404
            );
        }

        if (empty($dto->evaluators)) {
            throw new DomainException(
                'Danh sách giám khảo phân công không được để trống',
                'INVALID_ASSIGNMENT_DATA',
                null,
                400
            );
        }

        foreach ($dto->evaluators as $evaluatorData) {
            $evaluatorId = $evaluatorData['evaluator_id'];
            $role = $evaluatorData['role'] ?? 'MEMBER';

            // Check if already assigned
            $existing = EvaluatorAssignmentModel::where('evaluation_session_id', $sessionId)
                ->where('evaluator_id', $evaluatorId)
                ->first();

            if (!$existing) {
                $assignmentModel = EvaluatorAssignmentModel::create([
                    'id' => (string) Str::uuid(),
                    'evaluation_session_id' => $sessionId,
                    'evaluator_id' => $evaluatorId,
                    'role' => $role,
                    'status' => 'ASSIGNED',
                    'assigned_at' => now(),
                ]);

                $this->auditService->log(
                    action: 'EVALUATOR_ASSIGNED',
                    entityType: 'EvaluatorAssignment',
                    entityId: $assignmentModel->id,
                    after: $assignmentModel->toArray(),
                    cooperativeId: $session->application->cooperative_id ?? null
                );
            }
        }

        return $session->load(['assignments.evaluator', 'application', 'councilLevel']);
    }

    public function getSession(string $id): EvaluationSessionModel
    {
        $session = EvaluationSessionModel::with([
            'application',
            'councilLevel',
            'assignments.evaluator',
            'assignments.scores',
            'consolidatedResult.proposedClassification',
        ])->find($id);

        if (!$session) {
            throw new DomainException(
                "Không tìm thấy phiên họp đánh giá với ID: {$id}",
                'EVALUATION_SESSION_NOT_FOUND',
                null,
                404
            );
        }

        return $session;
    }

    public function listSessions(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = EvaluationSessionModel::with(['application', 'councilLevel', 'assignments']);

        if (!empty($filters['application_id'])) {
            $query->where('application_id', $filters['application_id']);
        }
        if (!empty($filters['council_level_id'])) {
            $query->where('council_level_id', $filters['council_level_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function updateSession(string $id, array $data): EvaluationSessionModel
    {
        $session = $this->getSession($id);

        if (isset($data['status'])) {
            $session->status = $data['status'];
            if ($data['status'] === 'IN_PROGRESS' && !$session->started_at) {
                $session->started_at = now();
            }
            if ($data['status'] === 'COMPLETED' && !$session->completed_at) {
                $session->completed_at = now();
            }
        }

        $session->save();

        return $session->fresh(['application', 'councilLevel', 'assignments']);
    }
}
