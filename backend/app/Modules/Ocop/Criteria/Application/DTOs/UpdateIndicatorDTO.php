<?php

namespace Modules\Ocop\Criteria\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateIndicatorDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $description = null,
        public readonly ?float $maxScore = null,
        public readonly ?bool $mandatory = null,
        public readonly ?array $evidenceRequirement = null,
        public readonly ?int $displayOrder = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: isset($data['name']) ? (string) $data['name'] : null,
            description: isset($data['description']) ? (string) $data['description'] : null,
            maxScore: isset($data['max_score']) ? (float) $data['max_score'] : null,
            mandatory: isset($data['mandatory']) ? (bool) $data['mandatory'] : null,
            evidenceRequirement: isset($data['evidence_requirement']) && is_array($data['evidence_requirement']) ? $data['evidence_requirement'] : null,
            displayOrder: isset($data['display_order']) ? (int) $data['display_order'] : null
        );
    }
}
