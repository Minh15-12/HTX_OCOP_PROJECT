<?php

namespace Modules\Ocop\Criteria\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class MandatoryCondition
{
    public function __construct(
        public readonly string $id,
        public readonly string $criteriaVersionId,
        public readonly string $conditionCode,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly string $conditionType = 'STAR_LIMIT',
        public readonly array $configuration = [],
        public readonly bool $blocking = true
    ) {
        if (trim($this->conditionCode) === '') {
            throw new DomainException('Mã điều kiện khống chế không được để trống', 'EMPTY_CONDITION_CODE');
        }
        if (trim($this->name) === '') {
            throw new DomainException('Tên điều kiện khống chế không được để trống', 'EMPTY_CONDITION_NAME');
        }
    }
}
