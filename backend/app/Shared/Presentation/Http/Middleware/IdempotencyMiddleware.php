<?php

namespace App\Shared\Presentation\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Shared\Infrastructure\Models\IdempotencyKeyModel;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class IdempotencyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->header('X-Idempotency-Key');

        if (!$idempotencyKey) {
            return $next($request);
        }

        // Check if key exists
        // Using pessimistic lock to prevent race condition if two requests come exactly at the same time
        DB::beginTransaction();

        try {
            $record = IdempotencyKeyModel::where('idempotency_key', $idempotencyKey)
                ->lockForUpdate()
                ->first();

            if ($record) {
                // If it's still processing (no response_code yet)
                if (is_null($record->response_code)) {
                    DB::rollBack();
                    return response()->json([
                        'error' => 'ERR_CONCURRENT_MODIFICATION',
                        'message' => 'Request is already being processed.'
                    ], 409);
                }

                // If already processed and successful (2xx), return cached response
                DB::rollBack();
                return response()->json($record->response_body, $record->response_code);
            }

            // Create new record
            IdempotencyKeyModel::create([
                'idempotency_key' => $idempotencyKey,
                'request_path' => $request->path(),
                'expires_at' => Carbon::now()->addHours(24),
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        // Process request
        $response = $next($request);

        // Save response if it's successful (2xx) or specific business logic errors that are considered "done" (e.g. 400, 422). 
        // We shouldn't cache 500s because we want the client to retry.
        $statusCode = $response->getStatusCode();
        if ($statusCode >= 200 && $statusCode < 500) {
            IdempotencyKeyModel::where('idempotency_key', $idempotencyKey)
                ->update([
                    'response_code' => $statusCode,
                    'response_body' => json_decode($response->getContent(), true) ?? $response->getContent(),
                ]);
        } else {
            // Delete key so it can be retried on 5xx errors
            IdempotencyKeyModel::where('idempotency_key', $idempotencyKey)->delete();
        }

        return $response;
    }
}
