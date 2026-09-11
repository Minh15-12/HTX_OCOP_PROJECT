<?php

namespace Modules\Agriculture\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class CropSeason
{
    public function __construct(
        public readonly string $id,
        public readonly string $productionUnitId,
        public readonly string $name,
        public readonly string $crop,
        public readonly string $startDate,
        public readonly string $expectedEndDate,
        public ?string $actualEndDate = null,
        public string $status = 'PLANNED',
        public readonly ?array $planInformation = null
    ) {
        if ($this->expectedEndDate < $this->startDate) {
            throw new DomainException('Ngày dự kiến kết thúc không thể trước ngày bắt đầu mùa vụ', 'INVALID_SEASON_DATES');
        }
        if ($this->actualEndDate !== null && $this->actualEndDate < $this->startDate) {
            throw new DomainException('Ngày kết thúc thực tế không thể trước ngày bắt đầu mùa vụ', 'INVALID_SEASON_DATES');
        }
    }

    public function close(?string $endDate = null): void
    {
        if ($this->status === 'COMPLETED' || $this->status === 'CANCELLED') {
            throw new DomainException('Mùa vụ đã đóng hoặc đã hủy trước đó', 'SEASON_ALREADY_CLOSED');
        }

        $closeDate = $endDate ?: now()->toDateString();
        if ($closeDate < $this->startDate) {
            throw new DomainException('Ngày đóng mùa vụ không thể trước ngày bắt đầu', 'INVALID_SEASON_DATES');
        }

        $this->status = 'COMPLETED';
        $this->actualEndDate = $closeDate;
    }
}
