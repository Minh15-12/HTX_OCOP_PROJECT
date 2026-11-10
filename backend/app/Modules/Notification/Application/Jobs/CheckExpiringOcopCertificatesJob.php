<?php

namespace Modules\Notification\Application\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Notification\Domain\Notifications\ExpiringOcopNotification;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;

class CheckExpiringOcopCertificatesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Certified applications are valid for 36 months.
        // We warn when there are 3 months left, meaning completed_at is <= 33 months ago
        $thirtyThreeMonthsAgo = now()->subMonths(33)->format('Y-m-d H:i:s');
        $thirtySixMonthsAgo = now()->subMonths(36)->format('Y-m-d H:i:s');

        $applications = OcopApplicationModel::where('status', 'CERTIFIED')
            ->whereNotNull('completed_at')
            ->where('completed_at', '<=', $thirtyThreeMonthsAgo)
            ->where('completed_at', '>=', $thirtySixMonthsAgo)
            ->get();

        foreach ($applications as $app) {
            $directors = UserModel::whereHas('roles', function ($q) {
                $q->where('code', 'DIRECTOR');
            })->where('cooperative_id', $app->cooperative_id)->get();

            foreach ($directors as $director) {
                $director->notify(new ExpiringOcopNotification($app));
            }
        }
    }
}
