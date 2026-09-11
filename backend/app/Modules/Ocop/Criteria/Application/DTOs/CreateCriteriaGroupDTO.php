<?php

namespace Modules\Ocop\Criteria\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateCriteriaGroupDTO extends BaseDTO
{
    public function __construct(
        public readonly string $criteriaVersionId,
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly int $displayOrder = 0
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            criteriaVersionId: (string) ($data['criteria_version_id'] ?? ''),
            code: (string) ($data['code'] ?? ''),
            name: (string) ($data['name'] ?? ''),
            description: isset($data['description']) ? (string) $data['description'] : null,
            displayOrder: isset($data['display_order']) ? (int) $data['display_order'] : 0
        );
    }
}
