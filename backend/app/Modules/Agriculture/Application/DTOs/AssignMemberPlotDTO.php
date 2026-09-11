<?php

namespace Modules\Agriculture\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class AssignMemberPlotDTO extends BaseDTO
{
    public function __construct(
        public readonly string $memberId,
        public readonly string $startDate,
        public readonly string $assignmentType = 'OWNER',
        public readonly ?string $endDate = null
    ) {}
}
