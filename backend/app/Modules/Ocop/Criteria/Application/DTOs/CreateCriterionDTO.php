<?php

namespace Modules\Ocop\Criteria\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateCriterionDTO extends BaseDTO
{
    public function __construct(
        public readonly string $criteriaGroupId,
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly float $maxScore = 0.0,
        public readonly bool $mandatory = false,
        public readonly int $displayOrder = 0
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            criteriaGroupId: (string) ($data['criteria_group_id'] ?? ''),
            code: (string) ($data['code'] ?? ''),
            name: (string) ($data['name'] ?? ''),
            description: isset($data['description']) ? (string) $data['description'] : null,
            maxScore: isset($data['max_score']) ? (float) $data['max_score'] : 0.0,
            mandatory: isset($data['mandatory']) ? (bool) $data['mandatory'] : false,
            displayOrder: isset($data['display_order']) ? (int) $data['display_order'] : 0
        );
    }
}
