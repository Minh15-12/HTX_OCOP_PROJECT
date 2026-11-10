<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'system' => 'HTX-OCOP Management System API',
        'status' => 'ONLINE',
        'version' => '1.0.0',
        'docs' => '/api/v1/health',
    ]);
});
