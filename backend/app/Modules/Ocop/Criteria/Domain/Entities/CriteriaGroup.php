<?php

namespace Modules\Ocop\Criteria\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class CriteriaGroup
{
    public function __construct(
        public readonly string $id,
        public readonly string $criteriaVersionId,
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly int $displayOrder = 0
    ) {
        if (trim($this->code) === '') {
            throw new DomainException('Mã nhóm tiêu chí không được để trống', 'EMPTY_GROUP_CODE');
        }
        if (trim($this->name) === '') {
            throw new DomainException('Tên nhóm tiêu chí không được để trống', 'EMPTY_GROUP_NAME');
        }
    }
}
