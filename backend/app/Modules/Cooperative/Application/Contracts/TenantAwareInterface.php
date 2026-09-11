<?php

namespace Modules\Cooperative\Application\Contracts;

interface TenantAwareInterface
{
    public function getCooperativeId(): ?string;
}
