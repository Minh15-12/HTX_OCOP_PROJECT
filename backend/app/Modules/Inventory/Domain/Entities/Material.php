<?php

namespace Modules\Inventory\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class Material
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $sku,
        public readonly string $name,
        public readonly string $category,
        public readonly string $unit,
        public readonly ?array $safetyInformation = null,
        public readonly float $reorderThreshold = 0.0,
        public readonly string $status = 'ACTIVE'
    ) {
        if (trim($this->sku) === '') {
            throw new DomainException('Mã SKU vật tư không được để trống', 'EMPTY_SKU');
        }
        if (trim($this->name) === '') {
            throw new DomainException('Tên vật tư không được để trống', 'EMPTY_MATERIAL_NAME');
        }
    }
}
