<?php

namespace Modules\Ocop\Dossier\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateOcopApplicationDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $applicationType = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            applicationType: isset($data['application_type']) ? (string) $data['application_type'] : null
        );
    }
}
