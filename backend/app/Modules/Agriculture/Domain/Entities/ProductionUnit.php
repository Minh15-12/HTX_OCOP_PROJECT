<?php

namespace Modules\Agriculture\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class ProductionUnit
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $unitCode,
        public readonly string $name,
        public readonly string $crop,
        public readonly float $area,
        public readonly ?array $location = null,
        public readonly string $status = 'ACTIVE',
        public readonly ?array $registrationInformation = null
    ) {
        if ($this->area <= 0) {
            throw new DomainException('Diện tích Vùng sản xuất phải lớn hơn 0', 'INVALID_AREA');
        }
    }
}
