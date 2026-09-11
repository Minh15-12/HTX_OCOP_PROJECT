<?php

namespace Modules\Ocop\Criteria\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateCriteriaVersionDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $effectiveFrom = null,
        public readonly ?string $effectiveTo = null,
        public readonly ?array $sourceReference = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: isset($data['name']) ? (string) $data['name'] : null,
            effectiveFrom: isset($data['effective_from']) ? (string) $data['effective_from'] : null,
            effectiveTo: isset($data['effective_to']) ? (string) $data['effective_to'] : null,
            sourceReference: isset($data['source_reference']) && is_array($data['source_reference']) ? $data['source_reference'] : null
        );
    }
}
