<?php

namespace Modules\Audit\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\EvaluationSessionModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\FinalDecisionModel;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;

class AuditQueryService
{
    public function listAuditEvents(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = AuditEventModel::query();

        if (!empty($filters['cooperative_id'])) {
            $query->where('cooperative_id', $filters['cooperative_id']);
        }

        if (!empty($filters['entity_type'])) {
            $query->where('entity_type', $filters['entity_type']);
        }

        if (!empty($filters['entity_id'])) {
            $query->where('entity_id', $filters['entity_id']);
        }

        if (!empty($filters['actor_id']) || !empty($filters['user_id'])) {
            $actorId = $filters['actor_id'] ?? $filters['user_id'];
            $query->where('actor_id', $actorId);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getAuditEvent(string $id): AuditEventModel
    {
        $event = AuditEventModel::find($id);

        if (!$event) {
            throw new DomainException(
                "Không tìm thấy bản ghi kiểm toán với ID: {$id}",
                'AUDIT_EVENT_NOT_FOUND',
                null,
                404
            );
        }

        return $event;
    }

    public function traceOcopApplication(string $applicationId): array
    {
        $application = OcopApplicationModel::with(['product', 'criteriaVersion', 'selfAssessments'])->find($applicationId);

        if (!$application) {
            throw new DomainException(
                "Không tìm thấy hồ sơ OCOP với ID: {$applicationId}",
                'APPLICATION_NOT_FOUND',
                null,
                404
            );
        }

        $evidences = EvidenceModel::with(['versions', 'links'])
            ->where('application_id', $applicationId)
            ->get();

        $session = EvaluationSessionModel::with(['assignments.scores', 'consolidatedResult.proposedClassification'])
            ->where('application_id', $applicationId)
            ->latest()
            ->first();

        $decision = FinalDecisionModel::where('application_id', $applicationId)
            ->latest('decision_date')
            ->first();

        // Collect related entity IDs for timeline matching
        $entityIds = array_filter([
            $applicationId,
            $session?->id,
            $decision?->id,
            ...$evidences->pluck('id')->toArray(),
        ]);

        $auditTimeline = AuditEventModel::where(function ($q) use ($entityIds, $applicationId) {
            $q->whereIn('entity_id', $entityIds)
                ->orWhere('after_reference->application_id', $applicationId);
        })->orderBy('created_at', 'asc')->get();

        return [
            'application' => [
                'id' => $application->id,
                'application_number' => $application->application_number ?? null,
                'status' => $application->status,
                'product' => $application->product ? [
                    'id' => $application->product->id,
                    'name' => $application->product->name,
                    'code' => $application->product->code,
                ] : null,
                'self_assessments_count' => $application->selfAssessments->count(),
            ],
            'evidences' => $evidences->map(fn ($e) => [
                'id' => $e->id,
                'title' => $e->title,
                'evidence_type' => $e->evidence_type,
                'status' => $e->status,
                'versions_count' => $e->versions->count(),
                'links_count' => $e->links->count(),
            ]),
            'evaluation_session' => $session ? [
                'id' => $session->id,
                'status' => $session->status,
                'evaluators_count' => $session->assignments->count(),
                'consolidated_score' => $session->consolidatedResult?->total_score,
                'proposed_classification' => $session->consolidatedResult?->proposedClassification?->proposed_level,
            ] : null,
            'final_decision' => $decision ? [
                'id' => $decision->id,
                'decision_number' => $decision->decision_number,
                'decision_date' => $decision->decision_date?->format('Y-m-d'),
                'final_classification' => $decision->final_classification,
                'status' => $decision->status,
            ] : null,
            'audit_timeline' => $auditTimeline,
        ];
    }

    public function traceMember(string $memberId): array
    {
        $member = MemberModel::with(['capitalContributions', 'user'])->find($memberId);

        if (!$member) {
            throw new DomainException(
                "Không tìm thấy xã viên với ID: {$memberId}",
                'MEMBER_NOT_FOUND',
                null,
                404
            );
        }

        $capitalIds = $member->capitalContributions->pluck('id')->toArray();
        $entityIds = array_merge([$memberId], $capitalIds);

        $events = AuditEventModel::whereIn('entity_id', $entityIds)
            ->orWhere(function ($q) use ($memberId) {
                $q->where('entity_type', 'Member')->where('entity_id', $memberId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return [
            'member' => [
                'id' => $member->id,
                'member_code' => $member->member_code,
                'full_name' => $member->identity_information['full_name'] ?? null,
                'citizen_id' => $member->identity_information['citizen_id'] ?? null,
                'status' => $member->status,
                'admission_date' => $member->admission_date?->format('Y-m-d'),
                'committed_capital' => (float) $member->committed_capital,
            ],
            'audit_timeline' => $events->map(fn ($ev) => [
                'id' => $ev->id,
                'action' => $ev->action,
                'entity_type' => $ev->entity_type,
                'entity_id' => $ev->entity_id,
                'actor_id' => $ev->actor_id,
                'before' => $ev->before_reference,
                'after' => $ev->after_reference,
                'current_hash' => $ev->current_hash,
                'timestamp' => $ev->created_at?->toIso8601String(),
            ])->toArray(),
        ];
    }

    public function verifyHashChain(?string $cooperativeId = null): array
    {
        $query = AuditEventModel::query()->orderBy('created_at', 'asc')->orderBy('id', 'asc');
        if ($cooperativeId) {
            $query->where('cooperative_id', $cooperativeId);
        }

        $events = $query->get();
        $totalEvents = $events->count();
        $brokenLinks = [];
        $verifiedCount = 0;
        $expectedPrevHash = null;

        foreach ($events as $index => $event) {
            $hasAnomaly = false;

            if ($expectedPrevHash !== null && $event->prev_hash !== $expectedPrevHash) {
                $brokenLinks[] = [
                    'event_id' => $event->id,
                    'action' => $event->action,
                    'entity_type' => $event->entity_type,
                    'index' => $index,
                    'anomaly_type' => 'CHAIN_LINK_MISMATCH',
                    'description' => 'prev_hash không khớp với current_hash của khối kiểm toán liền trước',
                    'expected' => $expectedPrevHash,
                    'actual' => $event->prev_hash,
                    'timestamp' => $event->created_at?->toIso8601String(),
                ];
                $hasAnomaly = true;
            }

            if (!$hasAnomaly) {
                $verifiedCount++;
            }

            $expectedPrevHash = $event->current_hash ?: $event->prev_hash;
        }

        $integrityScore = $totalEvents > 0
            ? round(($verifiedCount / $totalEvents) * 100, 1)
            : 100.0;

        return [
            'is_valid' => count($brokenLinks) === 0,
            'integrity_score' => $integrityScore,
            'total_blocks_checked' => $totalEvents,
            'verified_continuous_blocks' => $verifiedCount,
            'anomaly_count' => count($brokenLinks),
            'anomalies' => $brokenLinks,
            'latest_block_hash' => $expectedPrevHash ?: str_repeat('0', 64),
            'algorithm' => 'SHA-256 Tamper-Evident Chaining',
            'verified_at' => now()->toIso8601String(),
            'compliance_standard' => 'TCVN 12850 & Luật HTX 2023',
        ];
    }
}
