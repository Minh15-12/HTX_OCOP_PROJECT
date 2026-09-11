<?php

namespace Modules\Finance\Application\DTOs;

use App\Shared\Application\DTOs\BaseDTO;

class UpdateReceivablePayableDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $dueDate = null,
        public readonly ?string $description = null
    ) {}
}
