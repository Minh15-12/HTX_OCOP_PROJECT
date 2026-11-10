<?php

namespace App\Shared\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

class HealthController extends BaseController
{
    public function check(): JsonResponse
    {
        $dbStatus = 'OK';
        $dbLatency = null;
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $dbLatency = round((microtime(true) - $start) * 1000, 2).'ms';
        } catch (Throwable $e) {
            $dbStatus = 'FAIL: '.$e->getMessage();
        }

        $redisStatus = 'OK';
        $redisLatency = null;
        try {
            $start = microtime(true);
            Redis::connection()->ping();
            $redisLatency = round((microtime(true) - $start) * 1000, 2).'ms';
        } catch (Throwable $e) {
            $redisStatus = 'FAIL: '.$e->getMessage();
        }

        $allOk = ($dbStatus === 'OK');

        return ApiResponse::success(
            data: [
                'status' => $allOk ? 'HEALTHY' : 'DEGRADED',
                'services' => [
                    'database' => [
                        'connection' => config('database.default'),
                        'status' => $dbStatus,
                        'latency' => $dbLatency,
                    ],
                    'redis' => [
                        'status' => $redisStatus,
                        'latency' => $redisLatency,
                    ],
                ],
                'environment' => [
                    'name' => config('app.env'),
                    'timezone' => config('app.timezone'),
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                ],
            ],
            message: 'Hệ thống đang hoạt động bình thường',
            status: $allOk ? 200 : 503
        );
    }
}
