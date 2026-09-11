<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CalculatePhiDTO extends BaseDTO
{
    public function __construct(
        public readonly string $farmingLogId,
        public readonly string $materialId,
        public readonly string $applicationDate,
        public readonly ?int $configuredPhiDays = null,
        public readonly ?array $sourceReference = null
    ) {}
}
