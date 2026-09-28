<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        
        \Illuminate\Support\Facades\Event::listen(
            \Modules\Audit\Domain\Events\AuditEventCreated::class,
            \Modules\Notification\Application\Listeners\AuditEventListener::class
        );
    }
}
