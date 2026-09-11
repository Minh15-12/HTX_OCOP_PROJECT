<?php

namespace Modules\Ocop\Criteria\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateIndicatorDTO extends BaseDTO
{
    public function __construct(
        public readonly string $criterionId,
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly float $maxScore = 0.0,
        public readonly bool $mandatory = false,
        public readonly ?array $evidenceRequirement = null,
        public readonly int $displayOrder = 0
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            criterionId: (string) ($data['criterion_id'] ?? ''),
            code: (string) ($data['code'] ?? ''),
            name: (string) ($data['name'] ?? ''),
            description: isset($data['description']) ? (string) $data['description'] : null,
            maxScore: isset($data['max_score']) ? (float) $data['max_score'] : 0.0,
            mandatory: isset($data['mandatory']) ? (bool) $data['mandatory'] : false,
            evidenceRequirement: isset($data['evidence_requirement']) && is_array($data['evidence_requirement']) ? $data['evidence_requirement'] : null,
            displayOrder: isset($data['display_order']) ? (int) $data['display_order'] : 0
        );
    }
}
