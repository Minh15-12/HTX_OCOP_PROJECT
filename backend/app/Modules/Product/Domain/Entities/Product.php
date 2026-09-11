<?php

namespace Modules\Product\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class Product
{
    public function __construct(
        public readonly string $id,
        public readonly string $cooperativeId,
        public readonly string $productCode,
        public readonly string $productName,
        public readonly string $category,
        public readonly ?array $specification = null,
        public readonly ?string $brand = null,
        public readonly ?array $qualityInformation = null,
        public readonly string $status = 'ACTIVE'
    ) {
        if (trim($this->productCode) === '') {
            throw new DomainException('Mã sản phẩm không được để trống', 'EMPTY_PRODUCT_CODE');
        }
        if (trim($this->productName) === '') {
            throw new DomainException('Tên sản phẩm không được để trống', 'EMPTY_PRODUCT_NAME');
        }
    }
}
