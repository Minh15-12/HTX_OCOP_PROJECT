<?php

namespace App\Shared\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as RoutingController;

abstract class BaseController extends RoutingController
{
    use AuthorizesRequests, ValidatesRequests;

    protected function success(mixed $data = null, string $message = 'Success', array $meta = [], int $status = 200): JsonResponse
    {
        return ApiResponse::success($data, $message, $meta, $status);
    }

    protected function error(string $code, string $message, mixed $details = null, int $status = 400): JsonResponse
    {
        return ApiResponse::error($code, $message, $details, $status);
    }
}
