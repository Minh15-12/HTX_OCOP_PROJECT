<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateFarmingLogDTO extends BaseDTO
{
    public function __construct(
        public readonly string $cropSeasonId,
        public readonly string $plotId,
        public readonly string $activityType,
        public readonly string $activityDate,
        public readonly ?string $description = null,
        public readonly ?string $performedBy = null,
        public readonly ?array $attachmentReference = null
    ) {}
}
