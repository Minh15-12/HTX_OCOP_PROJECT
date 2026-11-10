<?php

namespace App\Shared\Domain\Exceptions;

use Exception;
use Throwable;

class DomainException extends Exception
{
    protected string $errorCode;

    protected mixed $errorDetails;

    public function __construct(string $message = '', string $errorCode = 'DOMAIN_ERROR', mixed $errorDetails = null, int $code = 400, ?Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->errorCode = $errorCode;
        $this->errorDetails = $errorDetails;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function getErrorDetails(): mixed
    {
        return $this->errorDetails;
    }
}
