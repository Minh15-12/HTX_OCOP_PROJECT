<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class IdempotencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Define a test route that uses the middleware
        Route::post('/test-idempotency', function () {
            return response()->json(['message' => 'Processed data', 'random' => rand(1, 1000)]);
        })->middleware('idempotency');
    }

    public function test_first_request_processes_normally_and_caches_response()
    {
        $idempotencyKey = 'test-key-123';

        $response = $this->withHeaders([
            'Idempotency-Key' => $idempotencyKey,
        ])->postJson('/test-idempotency');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertDatabaseHas('idempotency_keys', [
            'idempotency_key' => $idempotencyKey,
            'response_code' => 200,
        ]);

        // Second request with same key should return exact same response
        $response2 = $this->withHeaders([
            'Idempotency-Key' => $idempotencyKey,
        ])->postJson('/test-idempotency');

        $response2->assertStatus(200);
        $this->assertEquals($data, $response2->json());
    }

    public function test_different_keys_generate_different_responses()
    {
        $response1 = $this->withHeaders(['Idempotency-Key' => 'key-1'])->postJson('/test-idempotency');
        $response2 = $this->withHeaders(['Idempotency-Key' => 'key-2'])->postJson('/test-idempotency');

        // Due to rand() they should be different 99.9% of the time.
        // It proves that it didn't cache for key-2 from key-1.
        $this->assertNotEquals($response1->json('random'), $response2->json('random'));
    }
}
