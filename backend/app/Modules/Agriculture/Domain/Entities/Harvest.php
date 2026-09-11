<?php

namespace Modules\Agriculture\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class Harvest
{
    public function __construct(
        public readonly string $id,
        public readonly string $cropSeasonId,
        public readonly string $plotId,
        public readonly string $harvestDate,
        public readonly float $quantity,
        public readonly string $unit,
        public readonly ?array $qualityInformation = null,
        public ?string $lotId = null
    ) {
        if ($this->quantity <= 0) {
            throw new DomainException('Sản lượng thu hoạch phải lớn hơn 0', 'INVALID_HARVEST_QUANTITY');
        }
    }
}
