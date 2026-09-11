<?php

namespace Modules\Ocop\Evaluation\Application\DTOs;

class AssignEvaluatorsDTO
{
    /**
     * @param array<int, array{evaluator_id: string, role?: string}> $evaluators
     */
    public function __construct(
        public readonly array $evaluators
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            evaluators: $data['evaluators'] ?? []
        );
    }
}
