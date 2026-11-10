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

        \Illuminate\Support\Facades\Gate::define('viewApiDocs', function ($user = null) {
            return true;
        });
        
        \Illuminate\Support\Facades\Event::listen(
            \Modules\Audit\Domain\Events\AuditEventCreated::class,
            \Modules\Notification\Application\Listeners\AuditEventListener::class
        );

        // Enterprise rate limiting for login attempts
        \Illuminate\Support\Facades\RateLimiter::for('login', function (\Illuminate\Http\Request $request) {
            $username = (string) $request->input('username');
            $throttleKey = \Illuminate\Support\Str::transliterate(\Illuminate\Support\Str::lower($username).'|'.$request->ip());

            return [
                \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($throttleKey)->response(function () {
                    return response()->json([
                        'success' => false,
                        'code' => 'TOO_MANY_LOGIN_ATTEMPTS',
                        'message' => 'Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 1 phút.',
                        'data' => null,
                    ], 429);
                }),
                \Illuminate\Cache\RateLimiting\Limit::perMinute(20)->by($request->ip())->response(function () {
                    return response()->json([
                        'success' => false,
                        'code' => 'TOO_MANY_REQUESTS',
                        'message' => 'Địa chỉ IP của bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng thử lại sau.',
                        'data' => null,
                    ], 429);
                }),
            ];
        });
    }
}
