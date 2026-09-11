<?php

namespace Modules\Agriculture\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class FarmPlot
{
    public function __construct(
        public readonly string $id,
        public readonly string $productionUnitId,
        public readonly string $plotCode,
        public readonly float $area,
        public readonly ?array $landRelation = null,
        public readonly string $status = 'ACTIVE'
    ) {
        if ($this->area <= 0) {
            throw new DomainException('Diện tích Thửa đất canh tác phải lớn hơn 0', 'INVALID_AREA');
        }
    }
}
