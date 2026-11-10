<?php

use Illuminate\Support\Facades\Route;
use Modules\Notification\Presentation\Http\Controllers\NotificationController;

Route::group([
    'prefix' => 'notifications',
    'middleware' => ['auth:sanctum'],
], function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::post('/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
});

