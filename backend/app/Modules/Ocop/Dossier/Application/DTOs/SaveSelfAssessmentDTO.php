<?php

namespace Modules\Ocop\Dossier\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class SaveSelfAssessmentDTO extends BaseDTO
{
    public function __construct(
        public readonly string $indicatorId,
        public readonly float $score,
        public readonly ?string $explanation = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            indicatorId: (string) ($data['indicator_id'] ?? ''),
            score: isset($data['score']) ? (float) $data['score'] : 0.0,
            explanation: isset($data['explanation']) ? (string) $data['explanation'] : null
        );
    }
}
