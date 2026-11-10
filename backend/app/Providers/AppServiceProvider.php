<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Modules\Audit\Domain\Events\AuditEventCreated;
use Modules\Notification\Application\Listeners\AuditEventListener;

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

        Gate::define('viewApiDocs', function ($user = null) {
            return true;
        });

        Event::listen(
            AuditEventCreated::class,
            AuditEventListener::class
        );

        // Enterprise rate limiting for login attempts
        RateLimiter::for('login', function (Request $request) {
            $username = (string) $request->input('username');
            $throttleKey = Str::transliterate(Str::lower($username).'|'.$request->ip());

            return [
                Limit::perMinute(5)->by($throttleKey)->response(function () {
                    return response()->json([
                        'success' => false,
                        'code' => 'TOO_MANY_LOGIN_ATTEMPTS',
                        'message' => 'Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 1 phút.',
                        'data' => null,
                    ], 429);
                }),
                Limit::perMinute(20)->by($request->ip())->response(function () {
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
