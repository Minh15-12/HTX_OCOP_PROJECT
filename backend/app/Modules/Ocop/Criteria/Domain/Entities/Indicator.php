<?php

namespace Modules\Ocop\Criteria\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class Indicator
{
    public function __construct(
        public readonly string $id,
        public readonly string $criterionId,
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly float $maxScore = 0.0,
        public readonly bool $mandatory = false,
        public readonly ?array $evidenceRequirement = null,
        public readonly int $displayOrder = 0
    ) {
        if (trim($this->code) === '') {
            throw new DomainException('Mã chỉ tiêu không được để trống', 'EMPTY_INDICATOR_CODE');
        }
        if (trim($this->name) === '') {
            throw new DomainException('Tên chỉ tiêu không được để trống', 'EMPTY_INDICATOR_NAME');
        }
        if ($this->maxScore < 0.0 || $this->maxScore > 100.0) {
            throw new DomainException('Điểm tối đa của chỉ tiêu phải từ 0 đến 100', 'INVALID_INDICATOR_SCORE', null, 400);
        }
    }
}
