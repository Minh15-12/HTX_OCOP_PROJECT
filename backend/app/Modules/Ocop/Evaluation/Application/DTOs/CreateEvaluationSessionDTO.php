<?php

namespace Modules\Ocop\Evaluation\Application\DTOs;

class CreateEvaluationSessionDTO
{
    public function __construct(
        public readonly string $applicationId,
        public readonly string $councilLevelId
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            applicationId: $data['application_id'],
            councilLevelId: $data['council_level_id']
        );
    }
}
