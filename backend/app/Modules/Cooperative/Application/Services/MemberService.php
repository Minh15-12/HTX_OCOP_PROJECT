<?php

namespace Modules\Cooperative\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\DTOs\CreateMemberDTO;
use Modules\Cooperative\Application\DTOs\UpdateMemberDTO;
use Modules\Cooperative\Domain\Entities\Member;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;

class MemberService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listMembers(array $filters = [], int $perPage = 15, string $sort = '-created_at'): LengthAwarePaginator
    {
        $query = MemberModel::with(['cooperative', 'user']);

        // Multi-Tenant Isolation: Always filter by active cooperative_id
        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        // Whitelisted Filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['member_type'])) {
            $query->where('member_type', $filters['member_type']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $driver = DB::connection()->getDriverName();
            $likeOp = $driver === 'pgsql' ? 'ILIKE' : 'LIKE';

            $query->where(function ($q) use ($search, $driver, $likeOp) {
                $q->where('member_code', $likeOp, $search);

                if ($driver === 'pgsql') {
                    $q->orWhereRaw("identity_information->>'full_name' ILIKE ?", [$search])
                      ->orWhereRaw("identity_information->>'citizen_id' ILIKE ?", [$search])
                      ->orWhereRaw("identity_information->>'phone_number' ILIKE ?", [$search]);
                } elseif ($driver === 'sqlite') {
                    $q->orWhere('identity_information', 'LIKE', $search)
                      ->orWhereRaw("json_extract(identity_information, '$.full_name') LIKE ?", [$search])
                      ->orWhereRaw("json_extract(identity_information, '$.citizen_id') LIKE ?", [$search])
                      ->orWhereRaw("json_extract(identity_information, '$.phone_number') LIKE ?", [$search]);
                } else {
                    $q->orWhere('identity_information', 'LIKE', $search);
                }
            });
        }

        // Whitelisted Sorting
        $sortDirection = 'desc';
        $sortField = ltrim($sort, '-');
        if (!str_starts_with($sort, '-')) {
            $sortDirection = 'asc';
        }

        $allowedSorts = ['created_at', 'member_code', 'admission_date', 'status'];
        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function getMemberById(string $memberId): MemberModel
    {
        $query = MemberModel::with(['cooperative', 'user']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $member = $query->where('id', $memberId)->first();

        if (!$member) {
            throw new DomainException('Xã viên không tồn tại hoặc thuộc Hợp tác xã khác', 'MEMBER_NOT_FOUND', null, 404);
        }

        return $member;
    }

    public function createMember(CreateMemberDTO $dto): MemberModel
    {
        $cooperativeId = $this->tenantContext->getCooperativeId() ?: $dto->cooperativeId;

        if (empty($cooperativeId)) {
            throw new DomainException('Cần xác định Hợp tác xã trước khi thêm mới xã viên', 'TENANT_REQUIRED', null, 400);
        }

        // Duplicate member_code check per cooperative
        $exists = MemberModel::where('cooperative_id', $cooperativeId)
            ->where('member_code', $dto->memberCode)
            ->exists();

        if ($exists) {
            throw new DomainException("Mã xã viên [{$dto->memberCode}] đã tồn tại trong Hợp tác xã", 'DUPLICATE_MEMBER_CODE', null, 409);
        }

        $member = MemberModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $cooperativeId,
            'member_code' => $dto->memberCode,
            'identity_information' => $dto->identityInformation,
            'member_type' => $dto->memberType,
            'status' => 'DRAFT',
            'user_id' => $dto->userId,
            'admission_date' => $dto->admissionDate ?: now()->toDateString(),
        ]);

        $this->auditService->log(
            action: 'MEMBER_CREATED',
            entityType: 'Member',
            entityId: $member->id,
            after: $member->toArray(),
            cooperativeId: $cooperativeId
        );

        return $member->load(['cooperative', 'user']);
    }

    public function updateMember(string $memberId, UpdateMemberDTO $dto): MemberModel
    {
        $member = $this->getMemberById($memberId);
        $before = $member->toArray();

        $updates = [];
        if ($dto->identityInformation !== null) {
            $updates['identity_information'] = array_merge($member->identity_information ?? [], $dto->identityInformation);
        }
        if ($dto->memberType !== null) {
            $updates['member_type'] = $dto->memberType;
        }
        if ($dto->userId !== null) {
            $updates['user_id'] = $dto->userId;
        }
        if ($dto->admissionDate !== null) {
            $updates['admission_date'] = $dto->admissionDate;
        }

        if (!empty($updates)) {
            $member->update($updates);

            $this->auditService->log(
                action: 'MEMBER_UPDATED',
                entityType: 'Member',
                entityId: $member->id,
                before: $before,
                after: $member->toArray(),
                cooperativeId: $member->cooperative_id
            );
        }

        return $member->fresh(['cooperative', 'user']);
    }

    public function approveMember(string $memberId): MemberModel
    {
        $memberModel = $this->getMemberById($memberId);

        $domainEntity = new Member(
            id: $memberModel->id,
            cooperativeId: $memberModel->cooperative_id,
            memberCode: $memberModel->member_code,
            identityInformation: $memberModel->identity_information,
            memberType: $memberModel->member_type,
            status: $memberModel->status,
            userId: $memberModel->user_id,
            admissionDate: $memberModel->admission_date?->toDateString(),
            terminationDate: $memberModel->termination_date?->toDateString()
        );

        $before = $memberModel->toArray();
        $domainEntity->approve();

        $memberModel->update([
            'status' => $domainEntity->status,
        ]);

        $this->auditService->log(
            action: 'MEMBER_APPROVED',
            entityType: 'Member',
            entityId: $memberModel->id,
            before: $before,
            after: $memberModel->toArray(),
            cooperativeId: $memberModel->cooperative_id
        );

        return $memberModel->fresh(['cooperative', 'user']);
    }

    public function transitionStatus(string $memberId, string $targetStatus, ?string $reason = null): MemberModel
    {
        $memberModel = $this->getMemberById($memberId);

        $domainEntity = new Member(
            id: $memberModel->id,
            cooperativeId: $memberModel->cooperative_id,
            memberCode: $memberModel->member_code,
            identityInformation: $memberModel->identity_information,
            memberType: $memberModel->member_type,
            status: $memberModel->status,
            userId: $memberModel->user_id,
            admissionDate: $memberModel->admission_date?->toDateString(),
            terminationDate: $memberModel->termination_date?->toDateString()
        );

        $before = $memberModel->toArray();
        $domainEntity->transitionTo($targetStatus);

        $updates = [
            'status' => $domainEntity->status,
        ];
        if ($domainEntity->terminationDate !== null) {
            $updates['termination_date'] = $domainEntity->terminationDate;
        }

        $memberModel->update($updates);

        $this->auditService->log(
            action: 'MEMBER_STATUS_CHANGED',
            entityType: 'Member',
            entityId: $memberModel->id,
            before: $before,
            after: array_merge($memberModel->toArray(), ['reason' => $reason]),
            cooperativeId: $memberModel->cooperative_id
        );

        return $memberModel->fresh(['cooperative', 'user']);
    }
}
