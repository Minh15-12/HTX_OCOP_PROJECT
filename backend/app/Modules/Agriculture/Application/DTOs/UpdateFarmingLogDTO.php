<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateFarmingLogDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $activityType = null,
        public readonly ?string $activityDate = null,
        public readonly ?string $description = null,
        public readonly ?string $performedBy = null,
        public readonly ?array $attachmentReference = null
    ) {}
}
