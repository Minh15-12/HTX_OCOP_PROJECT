<?php

namespace Modules\Ocop\Criteria\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class ScoringRule
{
    public function __construct(
        public readonly string $id,
        public readonly string $criteriaVersionId,
        public readonly string $ruleCode,
        public readonly string $ruleType,
        public readonly array $configuration = [],
        public readonly int $priority = 0,
        public readonly string $status = 'ACTIVE'
    ) {
        if (trim($this->ruleCode) === '') {
            throw new DomainException('Mã quy tắc chấm điểm không được để trống', 'EMPTY_RULE_CODE');
        }
    }
}
