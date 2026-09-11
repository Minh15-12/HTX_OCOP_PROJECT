<?php

use App\Shared\Infrastructure\Exceptions\GlobalExceptionHandler;
use App\Shared\Presentation\Http\Middleware\RequestIdMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api/v1',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(RequestIdMiddleware::class);
        
        $middleware->alias([
            'tenant.scope' => \Modules\Cooperative\Presentation\Http\Middleware\EnforceTenantScope::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        GlobalExceptionHandler::register($exceptions);
    })->create();
