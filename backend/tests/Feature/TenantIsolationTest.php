<?php

namespace Tests\Feature;

use Modules\Cooperative\Application\Services\TenantContext;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    public function test_tenant_context_stores_and_retrieves_cooperative_id(): void
    {
        $tenantContext = new TenantContext;
        $this->assertFalse($tenantContext->hasTenant());

        $tenantContext->setCooperativeId('11111111-1111-1111-1111-111111111111');
        $this->assertTrue($tenantContext->hasTenant());
        $this->assertEquals('11111111-1111-1111-1111-111111111111', $tenantContext->getCooperativeId());
    }
}
