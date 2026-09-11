<?php

namespace App\Shared\Application\Responses;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ApiResponse
{
    /**
     * Standard success JSON response.
     */
    public static function success(mixed $data = null, string $message = 'Success', array $meta = [], int $status = Response::HTTP_OK): JsonResponse
    {
        $traceId = request()->header('X-Request-ID', (string) \Illuminate\Support\Str::uuid());

        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => array_merge([
                'timestamp' => now()->toIso8601String(),
                'trace_id' => $traceId,
            ], $meta),
        ];

        return response()->json($payload, $status)->header('X-Request-ID', $traceId);
    }

    /**
     * Standard error JSON response.
     */
    public static function error(string $code, string $message, mixed $details = null, int $status = Response::HTTP_BAD_REQUEST): JsonResponse
    {
        $traceId = request()->header('X-Request-ID', (string) \Illuminate\Support\Str::uuid());

        $payload = [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => $details ?? (object)[],
                'trace_id' => $traceId,
                'timestamp' => now()->toIso8601String(),
            ],
        ];

        return response()->json($payload, $status)->header('X-Request-ID', $traceId);
    }

    /**
     * Standard paginated response.
     */
    public static function paginated(\Illuminate\Contracts\Pagination\LengthAwarePaginator $paginator, string $message = 'Success'): JsonResponse
    {
        return self::success(
            data: $paginator->items(),
            message: $message,
            meta: [
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ]
        );
    }
}
