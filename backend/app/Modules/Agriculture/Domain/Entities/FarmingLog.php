<?php

namespace Modules\Agriculture\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class FarmingLog
{
    public function __construct(
        public readonly string $id,
        public readonly string $cropSeasonId,
        public readonly string $plotId,
        public readonly string $activityType,
        public readonly string $activityDate,
        public readonly ?string $description = null,
        public readonly ?string $performedBy = null,
        public readonly ?array $attachmentReference = null
    ) {
        $allowedActivities = [
            'SPRAYING',
            'FERTILIZING',
            'PLOWING',
            'WEEDING',
            'HARVESTING',
            'IRRIGATION',
            'PRUNING',
        ];

        if (!in_array($this->activityType, $allowedActivities, true)) {
            throw new DomainException(
                "Loại hoạt động canh tác [{$this->activityType}] không được hỗ trợ",
                'INVALID_ACTIVITY_TYPE'
            );
        }
    }
}
