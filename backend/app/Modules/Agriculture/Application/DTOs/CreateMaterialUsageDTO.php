<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateMaterialUsageDTO extends BaseDTO
{
    public function __construct(
        public readonly string $farmingLogId,
        public readonly string $materialId,
        public readonly float $quantity,
        public readonly string $unit,
        public readonly ?string $batchReference = null
    ) {}
}
