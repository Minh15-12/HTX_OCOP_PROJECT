<?php

namespace Modules\Cooperative\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Infrastructure\Persistence\Models\MeetingModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\VoteModel;

class MeetingService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listMeetings(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = MeetingModel::with('cooperative')
            ->withCount('votes');

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['meeting_type'])) {
            $query->where('meeting_type', $filters['meeting_type']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('title', $likeOp, $search)
                  ->orWhere('description', $likeOp, $search);
            });
        }

        return $query->orderBy('meeting_date', 'desc')->paginate(min(max($perPage, 1), 100));
    }

    public function getMeetingById(string $id): MeetingModel
    {
        $meeting = MeetingModel::with('cooperative')
            ->withCount('votes')
            ->find($id);

        if (!$meeting) {
            throw new DomainException('Cuộc họp / Đại hội không tồn tại trong hệ thống', 'MEETING_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $meeting->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập đại hội của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $meeting;
    }

    public function createMeeting(array $data): MeetingModel
    {
        $coopId = $this->tenantContext->hasTenant()
            ? $this->tenantContext->getCooperativeId()
            : ($data['cooperative_id'] ?? null);

        if (!$coopId) {
            throw new DomainException('Không xác định được Hợp tác xã chủ quản', 'MISSING_COOPERATIVE_CONTEXT', null, 400);
        }

        $type = match ($data['meeting_type']) {
            'DAI_HOI_THUONG_NIEN' => 'ANNUAL',
            'DAI_HOI_BAT_THUONG' => 'EXTRAORDINARY',
            default => $data['meeting_type'],
        };

        $meeting = MeetingModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopId,
            'meeting_type' => $type,
            'meeting_date' => $data['meeting_date'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'PLANNED',
        ]);

        $this->auditService->log(
            action: 'MEETING_CREATED',
            entityType: 'Meeting',
            entityId: $meeting->id,
            after: $meeting->toArray(),
            cooperativeId: $coopId
        );

        return $meeting->load('cooperative');
    }

    public function updateMeeting(string $id, array $data): MeetingModel
    {
        $meeting = $this->getMeetingById($id);
        $before = $meeting->toArray();

        $allowedFields = ['meeting_type', 'meeting_date', 'title', 'description', 'status'];
        $updatePayload = array_intersect_key($data, array_flip($allowedFields));

        if (!empty($updatePayload)) {
            $meeting->update($updatePayload);

            $this->auditService->log(
                action: 'MEETING_UPDATED',
                entityType: 'Meeting',
                entityId: $meeting->id,
                before: $before,
                after: $meeting->toArray(),
                cooperativeId: $meeting->cooperative_id
            );
        }

        return $meeting->fresh('cooperative');
    }

    public function listVotes(string $meetingId, ?string $resolutionCode = null): Collection
    {
        $meeting = $this->getMeetingById($meetingId);

        $query = VoteModel::with('user')
            ->where('meeting_id', $meeting->id);

        if ($resolutionCode) {
            $query->where('resolution_code', $resolutionCode);
        }

        return $query->orderBy('created_at', 'asc')->get();
    }

    public function castVote(string $meetingId, string $userId, array $data): VoteModel
    {
        $meeting = $this->getMeetingById($meetingId);

        if ($meeting->status === 'COMPLETED' || $meeting->status === 'CANCELLED') {
            throw new DomainException('Không thể biểu quyết cho cuộc họp đã kết thúc hoặc bị hủy', 'MEETING_CLOSED', null, 400);
        }

        $resolutionCode = trim($data['resolution_code']);

        // Check duplicate vote
        $existing = VoteModel::where('meeting_id', $meeting->id)
            ->where('user_id', $userId)
            ->where('resolution_code', $resolutionCode)
            ->exists();

        if ($existing) {
            throw new DomainException("Bạn đã thực hiện biểu quyết cho nghị quyết [{$resolutionCode}] rồi", 'DUPLICATE_VOTE', null, 409);
        }

        $choice = match ($data['choice']) {
            'DONG_Y' => 'FOR',
            'KHONG_DONG_Y' => 'AGAINST',
            'TRANG' => 'ABSTAIN',
            default => $data['choice'],
        };

        $resType = match ($data['resolution_type'] ?? 'REGULAR') {
            'TRONG_YEU', 'CRITICAL' => 'CRITICAL',
            default => 'REGULAR',
        };

        $vote = VoteModel::create([
            'id' => (string) Str::uuid(),
            'meeting_id' => $meeting->id,
            'user_id' => $userId,
            'resolution_code' => $resolutionCode,
            'resolution_type' => $resType,
            'choice' => $choice,
            'weight' => $data['weight'] ?? 1.0000,
            'created_at' => now(),
        ]);

        $this->auditService->log(
            action: 'VOTE_CAST',
            entityType: 'Vote',
            entityId: $vote->id,
            after: [
                'meeting_id' => $meeting->id,
                'user_id' => $userId,
                'resolution_code' => $resolutionCode,
                'resolution_type' => $resType,
                'choice' => $choice,
            ],
            cooperativeId: $meeting->cooperative_id
        );

        return $vote->load('user');
    }

    public function getResolutionsSummary(string $meetingId): array
    {
        $meeting = $this->getMeetingById($meetingId);
        $votes = VoteModel::where('meeting_id', $meeting->id)->get();

        $grouped = $votes->groupBy('resolution_code');
        $summary = [];

        foreach ($grouped as $resCode => $resVotes) {
            $totalVotes = $resVotes->count();
            $totalWeight = (float) $resVotes->sum('weight');

            $forVotes = $resVotes->where('choice', 'FOR');
            $againstVotes = $resVotes->where('choice', 'AGAINST');
            $abstainVotes = $resVotes->where('choice', 'ABSTAIN');

            $forWeight = (float) $forVotes->sum('weight');
            $againstWeight = (float) $againstVotes->sum('weight');
            $abstainWeight = (float) $abstainVotes->sum('weight');

            $approvalRate = $totalWeight > 0 ? round(($forWeight / $totalWeight) * 100, 2) : 0;

            // Luật HTX 2023 Điều 72:
            // Nghị quyết thông thường: >= 50%
            // Nghị quyết trọng yếu (sửa Điều lệ, tổ chức lại, sáp nhập, giải thể): >= 75%
            $isCritical = $resVotes->contains(fn($v) => $v->resolution_type === 'CRITICAL')
                || (bool) preg_match('/(DIEULE|GIAITHE|SAPNHAP|CRITICAL|TRONG_YEU)/i', $resCode);

            $resType = $isCritical ? 'CRITICAL' : 'REGULAR';
            $requiredPercentage = $isCritical ? 75.0 : 50.0;
            $isApproved = $approvalRate >= $requiredPercentage;

            $summary[] = [
                'resolution_code' => $resCode,
                'resolution_type' => $resType,
                'required_percentage' => $requiredPercentage,
                'total_voters' => $totalVotes,
                'total_weight' => $totalWeight,
                'for_count' => $forVotes->count(),
                'for_weight' => $forWeight,
                'against_count' => $againstVotes->count(),
                'against_weight' => $againstWeight,
                'abstain_count' => $abstainVotes->count(),
                'abstain_weight' => $abstainWeight,
                'approval_percentage' => $approvalRate,
                'is_approved' => $isApproved,
            ];
        }

        return $summary;
    }
}
