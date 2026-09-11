<?php

namespace Modules\Cooperative\Application\Services;

class TenantContext
{
    private ?string $cooperativeId = null;

    public function setCooperativeId(?string $id): void
    {
        $this->cooperativeId = $id;
    }

    public function getCooperativeId(): ?string
    {
        return $this->cooperativeId;
    }

    public function hasTenant(): bool
    {
        return !empty($this->cooperativeId);
    }
}
