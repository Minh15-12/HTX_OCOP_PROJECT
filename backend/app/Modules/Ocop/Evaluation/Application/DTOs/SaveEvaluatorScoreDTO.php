<?php

namespace Modules\Ocop\Evaluation\Application\DTOs;

class SaveEvaluatorScoreDTO
{
    /**
     * @param  array<int, array{indicator_id: string, score: float, comment?: string|null}>  $scores
     */
    public function __construct(
        public readonly array $scores
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            scores: $data['scores'] ?? []
        );
    }
}
