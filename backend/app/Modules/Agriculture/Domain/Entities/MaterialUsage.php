<?php

namespace Modules\Agriculture\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class MaterialUsage
{
    public function __construct(
        public readonly string $id,
        public readonly string $farmingLogId,
        public readonly string $materialId,
        public readonly float $quantity,
        public readonly string $unit,
        public readonly ?string $batchReference = null
    ) {
        if ($this->quantity <= 0) {
            throw new DomainException('Số lượng vật tư sử dụng phải lớn hơn 0', 'INVALID_QUANTITY');
        }
    }
}
