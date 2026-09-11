<?php

namespace Modules\Identity\Domain\ValueObjects;

use App\Shared\Domain\Exceptions\DomainException;

class Email
{
    public readonly string $value;

    public function __construct(string $value)
    {
        $filtered = filter_var(trim($value), FILTER_VALIDATE_EMAIL);
        if (!$filtered) {
            throw new DomainException('Địa chỉ email không đúng định dạng', 'INVALID_EMAIL');
        }
        $this->value = strtolower($filtered);
    }

    public function equals(Email $other): bool
    {
        return $this->value === $other->value;
    }
}
