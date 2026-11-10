<?php

namespace App\Shared\Presentation\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestIdMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-ID') ?: (string) Str::uuid();

        $request->headers->set('X-Request-ID', $requestId);

        Log::shareContext([
            'request_id' => $requestId,
            'ip' => $request->ip(),
            'method' => $request->method(),
            'uri' => $request->getRequestUri(),
        ]);

        $response = $next($request);

        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
