<?php

namespace Modules\Agriculture\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class Lot
{
    public function __construct(
        public readonly string $id,
        public readonly string $lotCode,
        public readonly string $harvestId,
        public readonly float $quantity,
        public readonly string $unit,
        public readonly string $status = 'CREATED',
        public readonly ?array $sourceInformation = null
    ) {
        if ($this->quantity <= 0) {
            throw new DomainException('Sản lượng lô hàng phải lớn hơn 0', 'INVALID_LOT_QUANTITY');
        }
    }
}
