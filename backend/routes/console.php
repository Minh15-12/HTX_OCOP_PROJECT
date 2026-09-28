<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment('HTX-OCOP Management System Bootstrap Ready');
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use Modules\Notification\Application\Jobs\CheckOverdueCapitalJob;
use Modules\Notification\Application\Jobs\CheckExpiringOcopCertificatesJob;
use Modules\Notification\Application\Jobs\CheckLowStockInventoryJob;

// Lên lịch chạy các Job thông báo tự động (thường chạy hàng ngày lúc 00:00)
Schedule::job(new CheckOverdueCapitalJob)->daily();
Schedule::job(new CheckExpiringOcopCertificatesJob)->daily();
Schedule::job(new CheckLowStockInventoryJob)->daily();
