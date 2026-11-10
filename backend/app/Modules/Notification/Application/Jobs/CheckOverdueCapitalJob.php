<?php

namespace Modules\Notification\Application\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Notification\Domain\Notifications\OverdueCapitalNotification;

class CheckOverdueCapitalJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $today = now()->format('Y-m-d');

        $members = MemberModel::where('status', 'DANG_HOAT_DONG')
            ->whereNotNull('commitment_deadline')
            ->whereDate('commitment_deadline', '<', $today)
            ->get();

        foreach ($members as $member) {
            $totalContributed = DB::table('capital_contributions')
                ->where('member_id', $member->id)
                ->where('status', 'APPROVED')
                ->sum('amount');

            $deficit = $member->committed_capital - $totalContributed;

            if ($deficit > 0) {
                // Notify directors of the cooperative
                $directors = UserModel::whereHas('roles', function ($q) {
                    $q->where('code', 'DIRECTOR');
                })->where('cooperative_id', $member->cooperative_id)->get();

                foreach ($directors as $director) {
                    $director->notify(new OverdueCapitalNotification($member, $deficit));
                }
            }
        }
    }
}
