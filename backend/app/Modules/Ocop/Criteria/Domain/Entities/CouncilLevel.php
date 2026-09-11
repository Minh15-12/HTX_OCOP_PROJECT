<?php

namespace Modules\Ocop\Criteria\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class CouncilLevel
{
    public function __construct(
        public readonly string $id,
        public readonly string $code,
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly int $sortOrder = 0,
        public readonly bool $isActive = true,
        public readonly ?string $validFrom = null,
        public readonly ?string $validTo = null,
        public readonly ?array $sourceReference = null
    ) {
        if (trim($this->code) === '') {
            throw new DomainException('Mã cấp hội đồng không được để trống', 'EMPTY_COUNCIL_LEVEL_CODE');
        }
        if (trim($this->name) === '') {
            throw new DomainException('Tên cấp hội đồng không được để trống', 'EMPTY_COUNCIL_LEVEL_NAME');
        }
    }
}
