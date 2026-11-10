<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Identity\Application\Services\AuthenticationService;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * Register services for all Modular Monolith modules.
     */
    public function register(): void
    {
        $this->app->singleton(TenantContext::class, function ($app) {
            return new TenantContext;
        });

        $this->app->singleton(AuditService::class, function ($app) {
            return new AuditService;
        });

        $this->app->scoped(AuthenticationService::class);
    }

    /**
     * Bootstrap module-specific configurations, routes or listeners.
     */
    public function boot(): void
    {
        //
    }
}
