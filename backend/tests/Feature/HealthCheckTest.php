<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_check_endpoint_returns_success_structure(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertHeader('X-Request-ID');
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'status',
                'services' => [
                    'database',
                    'redis',
                ],
                'environment',
            ],
            'meta' => [
                'timestamp',
                'trace_id',
            ],
        ]);
    }
}
