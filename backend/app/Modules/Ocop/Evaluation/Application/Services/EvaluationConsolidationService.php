<?php

namespace Modules\Ocop\Evaluation\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Evaluation\Domain\Entities\ConsolidatedResult;
use Modules\Ocop\Evaluation\Domain\Entities\ProposedClassification;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\ConsolidatedResultModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluationSessionModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluatorScoreModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\ProposedClassificationModel;

class EvaluationConsolidationService
{
    public function __construct(
        private readonly AuditService $auditService
    ) {}

    public function consolidate(string $sessionId): ConsolidatedResultModel
    {
        $session = EvaluationSessionModel::with(['application', 'assignments'])->find($sessionId);
        if (!$session) {
            throw new DomainException(
                "Không tìm thấy phiên họp đánh giá với ID: {$sessionId}",
                'EVALUATION_SESSION_NOT_FOUND',
                null,
                404
            );
        }

        $assignments = $session->assignments;
        if ($assignments->isEmpty()) {
            throw new DomainException(
                'Phiên họp chưa có giám khảo nào được phân công',
                'NO_EVALUATORS_ASSIGNED',
                null,
                400
            );
        }

        // Check council quorum requirement (minimum 3 evaluators per OCOP regulations)
        if ($assignments->count() < 3) {
            throw new DomainException(
                "Hội đồng đánh giá OCOP cần tối thiểu 3 thành viên tham gia để đạt túc số (Quorum requirement) trước khi tổng hợp kết quả (hiện chỉ có {$assignments->count()} giám khảo)",
                'ERR_COUNCIL_QUORUM_NOT_MET',
                null,
                400
            );
        }

        // Check if 100% of evaluators have locked their scores
        $unlockedCount = $assignments->filter(fn ($a) => $a->status !== 'LOCKED')->count();
        if ($unlockedCount > 0) {
            throw new DomainException(
                "Tất cả {$assignments->count()} giám khảo phải khóa phiếu chấm điểm trước khi tổng hợp kết quả (hiện còn {$unlockedCount} giám khảo chưa khóa)",
                'UNLOCKED_EVALUATORS_EXIST',
                null,
                400
            );
        }

        return DB::transaction(function () use ($session, $assignments) {
            $evaluatorCount = $assignments->count();
            $assignmentIds = $assignments->pluck('id')->toArray();

            // Fetch all scores for these assignments
            $scores = EvaluatorScoreModel::whereIn('assignment_id', $assignmentIds)->get();

            // Group scores by indicator_id
            $indicatorScores = $scores->groupBy('indicator_id');

            $indicatorAverages = [];
            $discrepancyDetected = false;
            $discrepancyIndicators = [];

            foreach ($indicatorScores as $indicatorId => $scoreGroup) {
                $scoreValues = $scoreGroup->pluck('score')->map(fn ($v) => (float) $v);
                $sum = $scoreValues->sum();
                $avg = $evaluatorCount > 0 ? round($sum / $evaluatorCount, 2) : 0.0;
                $indicatorAverages[$indicatorId] = $avg;

                $maxScore = $scoreValues->max();
                $minScore = $scoreValues->min();
                if (($maxScore - $minScore) > 10.00) {
                    $discrepancyDetected = true;
                    $discrepancyIndicators[] = $indicatorId;
                }
            }

            // Calculate total average score
            $totalScore = round(array_sum($indicatorAverages), 2);

            // Create domain entity to run score range validation invariant
            $domainResult = new ConsolidatedResult(
                id: (string) Str::uuid(),
                applicationId: $session->application_id,
                evaluationSessionId: $session->id,
                totalScore: $totalScore,
                consolidationStatus: 'CALCULATED'
            );

            // Save ConsolidatedResultModel
            $resultModel = ConsolidatedResultModel::updateOrCreate(
                ['evaluation_session_id' => $session->id],
                [
                    'id' => $domainResult->id,
                    'application_id' => $domainResult->applicationId,
                    'total_score' => $domainResult->totalScore,
                    'consolidation_status' => $domainResult->consolidationStatus,
                    'calculated_at' => now(),
                ]
            );

            // Determine Raw Star Classification
            $rawClassification = ProposedClassification::calculateRawClassification($totalScore);

            // Check mandatory star-limit indicators algorithm
            $mandatoryIndicators = IndicatorModel::where('mandatory', true)->get();
            $failedMandatory = [];

            foreach ($mandatoryIndicators as $mInd) {
                $avg = $indicatorAverages[$mInd->id] ?? 0.0;
                if ($avg <= 0.0) {
                    $failedMandatory[] = $mInd->name ?? $mInd->code ?? $mInd->id;
                }
            }

            $proposedLevel = $rawClassification;
            $reasons = [];

            if ($discrepancyDetected) {
                $reasons[] = 'CẢNH BÁO: Phát hiện độ lệch điểm giữa các giám khảo vượt quá 10.00 điểm (SCORE_DISCREPANCY_DETECTED).';
            }

            // Apply Star-limit Downgrade Algorithm if mandatory indicator not passed and score >= 70
            if (!empty($failedMandatory) && $totalScore >= 70.0) {
                if (in_array($rawClassification, ['4_STAR', '5_STAR'], true)) {
                    $proposedLevel = '3_STAR';
                    $reasons[] = 'Tự động khống chế hạ mức xếp hạng xuống 3_STAR do không đạt chỉ tiêu bắt buộc dấu sao (*): '.implode(', ', $failedMandatory);
                } elseif ($rawClassification === '3_STAR') {
                    $proposedLevel = 'UNRATED';
                    $reasons[] = 'Tự động khống chế không xếp hạng (UNRATED) do thiếu tiêu chuẩn bắt buộc dấu sao (*): '.implode(', ', $failedMandatory);
                }
            }

            $reasonText = implode(' | ', $reasons);

            // Save ProposedClassificationModel
            ProposedClassificationModel::updateOrCreate(
                ['result_id' => $resultModel->id],
                [
                    'id' => (string) Str::uuid(),
                    'application_id' => $session->application_id,
                    'result_id' => $resultModel->id,
                    'proposed_level' => $proposedLevel,
                    'reason' => $reasonText ?: null,
                    'status' => 'PROPOSED',
                ]
            );

            // Update session status
            $session->update([
                'status' => 'CONSOLIDATED',
                'completed_at' => now(),
            ]);

            $this->auditService->log(
                action: 'COUNCIL_SCORES_CONSOLIDATED',
                entityType: 'ConsolidatedResult',
                entityId: $resultModel->id,
                after: [
                    'total_score' => $totalScore,
                    'proposed_level' => $proposedLevel,
                    'discrepancy_detected' => $discrepancyDetected,
                    'reason' => $reasonText,
                ],
                cooperativeId: $session->application->cooperative_id ?? null
            );

            return $resultModel->load(['application', 'proposedClassification', 'session']);
        });
    }

    public function getConsolidatedResult(string $sessionId): ConsolidatedResultModel
    {
        $result = ConsolidatedResultModel::with(['application', 'proposedClassification', 'session'])
            ->where('evaluation_session_id', $sessionId)
            ->first();

        if (!$result) {
            throw new DomainException(
                "Chưa có kết quả tổng hợp cho phiên họp đánh giá ID: {$sessionId}",
                'CONSOLIDATED_RESULT_NOT_FOUND',
                null,
                404
            );
        }

        return $result;
    }
}
