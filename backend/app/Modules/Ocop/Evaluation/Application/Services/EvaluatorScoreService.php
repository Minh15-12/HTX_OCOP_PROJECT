<?php

namespace Modules\Ocop\Evaluation\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Evaluation\Application\DTOs\SaveEvaluatorScoreDTO;
use Modules\Ocop\Evaluation\Domain\Entities\EvaluatorScore;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluationSessionModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorAssignmentModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorScoreModel;

class EvaluatorScoreService
{
    public function __construct(
        private readonly AuditService $auditService
    ) {}

    public function saveScores(string $sessionId, string $evaluatorId, SaveEvaluatorScoreDTO $dto): Collection
    {
        $session = EvaluationSessionModel::find($sessionId);
        if (!$session) {
            throw new DomainException(
                "Không tìm thấy phiên họp đánh giá với ID: {$sessionId}",
                'EVALUATION_SESSION_NOT_FOUND',
                null,
                404
            );
        }

        $assignment = EvaluatorAssignmentModel::where('evaluation_session_id', $sessionId)
            ->where('evaluator_id', $evaluatorId)
            ->first();

        if (!$assignment) {
            throw new DomainException(
                'Giám khảo chưa được phân công vào phiên họp đánh giá này',
                'EVALUATOR_NOT_ASSIGNED',
                null,
                403
            );
        }

        if ($assignment->status === 'LOCKED') {
            throw new DomainException(
                'Phiếu chấm điểm của giám khảo đã khóa và không thể chỉnh sửa',
                'EVALUATION_SCORE_LOCKED',
                null,
                400
            );
        }

        $savedScores = collect();

        foreach ($dto->scores as $item) {
            $indicator = IndicatorModel::find($item['indicator_id']);
            if (!$indicator) {
                throw new DomainException(
                    "Không tìm thấy chỉ tiêu đánh giá với ID: {$item['indicator_id']}",
                    'INDICATOR_NOT_FOUND',
                    null,
                    404
                );
            }

            $scoreValue = (float) $item['score'];
            $maxScore = (float) $indicator->max_score;

            // Trigger domain entity constructor validation
            $domainScore = new EvaluatorScore(
                id: (string) Str::uuid(),
                assignmentId: $assignment->id,
                indicatorId: $indicator->id,
                score: $scoreValue,
                maxScore: $maxScore,
                comment: $item['comment'] ?? null
            );

            $existingScore = EvaluatorScoreModel::where('assignment_id', $assignment->id)
                ->where('indicator_id', $indicator->id)
                ->first();

            if ($existingScore) {
                if ($existingScore->locked_at !== null) {
                    throw new DomainException(
                        'Điểm của chỉ tiêu này đã bị khóa',
                        'EVALUATION_SCORE_LOCKED',
                        null,
                        400
                    );
                }

                $existingScore->update([
                    'score' => $domainScore->score,
                    'comment' => $domainScore->comment,
                    'submitted_at' => now(),
                ]);
                $savedScores->push($existingScore->fresh('indicator'));
            } else {
                $scoreModel = EvaluatorScoreModel::create([
                    'id' => $domainScore->id,
                    'assignment_id' => $assignment->id,
                    'indicator_id' => $indicator->id,
                    'score' => $domainScore->score,
                    'comment' => $domainScore->comment,
                    'submitted_at' => now(),
                ]);
                $savedScores->push($scoreModel->load('indicator'));
            }
        }

        // Update assignment status to SCORING if still ASSIGNED
        if ($assignment->status === 'ASSIGNED') {
            $assignment->update(['status' => 'SCORING']);
        }

        // Update session status to IN_PROGRESS if ASSIGNED
        if ($session->status === 'ASSIGNED') {
            $session->update([
                'status' => 'IN_PROGRESS',
                'started_at' => $session->started_at ?? now(),
            ]);
        }

        return $savedScores;
    }

    public function lockScores(string $identifier, string $currentUserId): EvaluatorAssignmentModel
    {
        // $identifier can be assignment_id or evaluator_score_id
        $assignment = EvaluatorAssignmentModel::with('scores')->find($identifier);

        if (!$assignment) {
            $scoreModel = EvaluatorScoreModel::with('assignment.scores')->find($identifier);
            if ($scoreModel) {
                $assignment = $scoreModel->assignment;
            }
        }

        if (!$assignment) {
            throw new DomainException(
                "Không tìm thấy thông tin phân công giám khảo hoặc phiếu chấm với ID: {$identifier}",
                'ASSIGNMENT_NOT_FOUND',
                null,
                404
            );
        }

        // Check ownership or admin
        if ($assignment->evaluator_id !== $currentUserId) {
            throw new DomainException(
                'Bạn không có quyền khóa phiếu chấm điểm này',
                'UNAUTHORIZED_SCORE_LOCK',
                null,
                403
            );
        }

        if ($assignment->status === 'LOCKED') {
            throw new DomainException(
                'Phiếu chấm điểm của giám khảo đã khóa trước đó',
                'EVALUATION_SCORE_LOCKED',
                null,
                400
            );
        }

        $assignment->update([
            'status' => 'LOCKED',
            'completed_at' => now(),
        ]);

        EvaluatorScoreModel::where('assignment_id', $assignment->id)->update([
            'locked_at' => now(),
        ]);

        $this->auditService->log(
            action: 'EVALUATION_SCORE_LOCKED',
            entityType: 'EvaluatorAssignment',
            entityId: $assignment->id,
            after: $assignment->toArray()
        );

        return $assignment->fresh(['scores.indicator', 'evaluator']);
    }

    public function getScoresBySession(string $sessionId, string $currentUserId, bool $isChairmanOrAdmin = false): Collection
    {
        $session = EvaluationSessionModel::with('assignments.scores.indicator')->find($sessionId);
        if (!$session) {
            throw new DomainException(
                "Không tìm thấy phiên họp đánh giá với ID: {$sessionId}",
                'EVALUATION_SESSION_NOT_FOUND',
                null,
                404
            );
        }

        // If consolidated or chairman/admin, return all assignments' scores
        if ($session->status === 'CONSOLIDATED' || $isChairmanOrAdmin) {
            return $session->assignments;
        }

        // Otherwise filter only current user's assignment
        return $session->assignments->filter(function ($assignment) use ($currentUserId) {
            return $assignment->evaluator_id === $currentUserId;
        })->values();
    }
}
