<?php

namespace App\Shared\Infrastructure\Exceptions;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class GlobalExceptionHandler
{
    public static function register(Exceptions $exceptions): void
    {
        $exceptions->renderable(function (ValidationException $e, $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return ApiResponse::error(
                    code: 'VALIDATION_FAILED',
                    message: 'Dữ liệu đầu vào không hợp lệ',
                    details: $e->errors(),
                    status: 422
                );
            }
        });

        $exceptions->renderable(function (AuthenticationException $e, $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return ApiResponse::error(
                    code: 'UNAUTHENTICATED',
                    message: 'Phiên làm việc chưa được xác thực hoặc đã hết hạn',
                    status: 401
                );
            }
        });

        $exceptions->renderable(function (AuthorizationException $e, $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return ApiResponse::error(
                    code: 'UNAUTHORIZED_ACCESS',
                    message: 'Bạn không có quyền thực hiện thao tác này hoặc truy cập dữ liệu thuộc HTX này',
                    status: 403
                );
            }
        });

        $exceptions->renderable(function (DomainException $e, $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return ApiResponse::error(
                    code: $e->getErrorCode(),
                    message: $e->getMessage(),
                    details: $e->getErrorDetails(),
                    status: $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400
                );
            }
        });

        $exceptions->renderable(function (ModelNotFoundException|NotFoundHttpException $e, $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return ApiResponse::error(
                    code: 'RESOURCE_NOT_FOUND',
                    message: 'Tài nguyên hoặc đường dẫn yêu cầu không tồn tại trong hệ thống',
                    status: 404
                );
            }
        });

        $exceptions->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                $status = $e instanceof HttpException ? $e->getStatusCode() : 500;
                $message = config('app.debug') ? $e->getMessage() : 'Hệ thống đã xảy ra lỗi xử lý nội bộ';
                $details = config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => explode("\n", $e->getTraceAsString()),
                ] : null;

                return ApiResponse::error(
                    code: 'INTERNAL_SERVER_ERROR',
                    message: $message,
                    details: $details,
                    status: $status
                );
            }
        });
    }
}
