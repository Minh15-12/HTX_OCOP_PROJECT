<?php

namespace Modules\Ocop\Dossier\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class OcopApplication
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $productId,
        public readonly string $criteriaVersionId,
        public readonly string $applicationNumber,
        public readonly string $applicationType = 'NEW', // NEW, RE_EVALUATION, UPGRADE
        public string $status = 'DRAFT',
        public ?string $submittedAt = null,
        public ?string $completedAt = null
    ) {
        if (trim($this->applicationNumber) === '') {
            throw new DomainException('Mã số hồ sơ OCOP không được để trống', 'EMPTY_APPLICATION_NUMBER');
        }
    }

    public function isEditable(): bool
    {
        return in_array($this->status, ['DRAFT', 'SELF_ASSESSING', 'NEED_REVISION'], true);
    }

    public function assertEditable(): void
    {
        if (!$this->isEditable()) {
            throw new DomainException(
                'Hồ sơ OCOP đã ở trạng thái khóa (đã nộp/đang xử lý) và không thể chỉnh sửa',
                'DOSSIER_READ_ONLY_LOCKED',
                null,
                400
            );
        }
    }

    public function assertCanSubmit(int $totalIndicatorsCount, int $assessedIndicatorsCount): void
    {
        if ($totalIndicatorsCount <= 0 || $assessedIndicatorsCount < $totalIndicatorsCount) {
            throw new DomainException(
                "Hồ sơ chưa hoàn thành tự đánh giá đủ 100% chỉ tiêu (đã đánh giá: {$assessedIndicatorsCount}/{$totalIndicatorsCount})",
                'INCOMPLETE_SELF_ASSESSMENT',
                null,
                400
            );
        }
    }

    public function markSelfAssessing(): void
    {
        $this->assertEditable();
        if ($this->status === 'DRAFT') {
            $this->status = 'SELF_ASSESSING';
        }
    }

    public function markReadyForSubmission(int $totalIndicatorsCount, int $assessedIndicatorsCount): void
    {
        $this->assertEditable();
        $this->assertCanSubmit($totalIndicatorsCount, $assessedIndicatorsCount);
        $this->status = 'READY_FOR_SUBMISSION';
    }

    public function submit(int $totalIndicatorsCount, int $assessedIndicatorsCount): void
    {
        $this->assertEditable();
        $this->assertCanSubmit($totalIndicatorsCount, $assessedIndicatorsCount);
        $this->status = 'SUBMITTED';
        $this->submittedAt = now()->toIso8601String();
    }
}
