<?php

namespace Modules\Ocop\Dossier\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class CreateOcopApplicationDTO extends BaseDTO
{
    public function __construct(
        public readonly string $productId,
        public readonly string $criteriaVersionId,
        public readonly string $applicationType = 'NEW',
        public readonly ?string $customApplicationNumber = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            productId: (string) ($data['product_id'] ?? ''),
            criteriaVersionId: (string) ($data['criteria_version_id'] ?? ''),
            applicationType: isset($data['application_type']) ? (string) $data['application_type'] : 'NEW',
            customApplicationNumber: isset($data['application_number']) ? (string) $data['application_number'] : null
        );
    }
}
