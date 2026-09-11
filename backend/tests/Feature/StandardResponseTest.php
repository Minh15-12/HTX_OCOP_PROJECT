<?php

namespace Tests\Feature;

use App\Shared\Application\Responses\ApiResponse;
use Tests\TestCase;

class StandardResponseTest extends TestCase
{
    public function test_api_response_formats_success_and_error_correctly(): void
    {
        $successResponse = ApiResponse::success(['test' => 123], 'OK Message');
        $this->assertEquals(200, $successResponse->getStatusCode());

        $data = json_decode($successResponse->getContent(), true);
        $this->assertTrue($data['success']);
        $this->assertEquals('OK Message', $data['message']);
        $this->assertEquals(123, $data['data']['test']);
        $this->assertArrayHasKey('timestamp', $data['meta']);
        $this->assertArrayHasKey('trace_id', $data['meta']);

        $errorResponse = ApiResponse::error('TEST_ERROR', 'Error Occurred', ['detail' => 'abc'], 400);
        $this->assertEquals(400, $errorResponse->getStatusCode());

        $errorData = json_decode($errorResponse->getContent(), true);
        $this->assertFalse($errorData['success']);
        $this->assertEquals('TEST_ERROR', $errorData['error']['code']);
        $this->assertEquals('Error Occurred', $errorData['error']['message']);
    }
}
