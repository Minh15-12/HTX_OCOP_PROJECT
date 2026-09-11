<?php

namespace Modules\Ocop\Criteria\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class Criterion
{
    public function __construct(
        public readonly string $id,
        public readonly string $criteriaGroupId,
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly float $maxScore = 0.0,
        public readonly bool $mandatory = false,
        public readonly int $displayOrder = 0
    ) {
        if (trim($this->code) === '') {
            throw new DomainException('Mã tiêu chí không được để trống', 'EMPTY_CRITERION_CODE');
        }
        if (trim($this->name) === '') {
            throw new DomainException('Tên tiêu chí không được để trống', 'EMPTY_CRITERION_NAME');
        }
        if ($this->maxScore < 0.0 || $this->maxScore > 100.0) {
            throw new DomainException('Điểm tối đa của tiêu chí phải nằm trong khoảng từ 0 đến 100', 'INVALID_CRITERION_SCORE', null, 400);
        }
    }
}
