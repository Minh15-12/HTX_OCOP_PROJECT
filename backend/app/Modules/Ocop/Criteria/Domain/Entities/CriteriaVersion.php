<?php

namespace Modules\Ocop\Criteria\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class CriteriaVersion
{
    public function __construct(
        public readonly string $id,
        public readonly string $versionCode,
        public readonly string $name,
        public readonly ?string $effectiveFrom = null,
        public readonly ?string $effectiveTo = null,
        public readonly ?array $sourceReference = null,
        public string $status = 'DRAFT'
    ) {
        if (trim($this->versionCode) === '') {
            throw new DomainException('Mã phiên bản bộ tiêu chí không được để trống', 'EMPTY_VERSION_CODE');
        }
        if (trim($this->name) === '') {
            throw new DomainException('Tên phiên bản bộ tiêu chí không được để trống', 'EMPTY_VERSION_NAME');
        }
    }

    public function isDraft(): bool
    {
        return $this->status === 'DRAFT';
    }

    public function isPublished(): bool
    {
        return $this->status === 'PUBLISHED' || $this->status === 'ACTIVE';
    }

    public function assertEditable(): void
    {
        if (!$this->isDraft()) {
            throw new DomainException(
                'Phiên bản bộ tiêu chí đã ở trạng thái PUBLISHED và không thể chỉnh sửa',
                'CRITERIA_VERSION_IMMUTABLE',
                null,
                400
            );
        }
    }

    public function publish(float $totalScore): void
    {
        $this->assertEditable();

        if (abs($totalScore - 100.00) > 0.001) {
            throw new DomainException(
                "Tổng điểm tối đa của bộ tiêu chí phải bằng đúng 100.00 (hiện tại: {$totalScore})",
                'TOTAL_SCORE_INVALID',
                null,
                400
            );
        }

        $this->status = 'PUBLISHED';
    }

    public function retire(): void
    {
        $this->status = 'RETIRED';
    }
}
