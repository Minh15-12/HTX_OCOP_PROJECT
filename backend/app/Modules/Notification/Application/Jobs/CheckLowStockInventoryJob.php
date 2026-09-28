<?php

namespace Modules\Notification\Application\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Notification\Domain\Notifications\LowStockNotification;

class CheckLowStockInventoryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $materials = MaterialModel::where('status', 'ACTIVE')->get();

        foreach ($materials as $material) {
            if (!$material->reorder_threshold) {
                continue;
            }

            $currentStock = DB::table('material_batches')
                ->where('material_id', $material->id)
                ->where('status', 'AVAILABLE')
                ->whereNull('deleted_at')
                ->sum('quantity');

            if ($currentStock < $material->reorder_threshold) {
                // Notify warehouse keepers and directors
                $staff = UserModel::whereHas('roles', function ($q) {
                    $q->whereIn('code', ['DIRECTOR', 'WAREHOUSE']);
                })->where('cooperative_id', $material->cooperative_id)->get();
                
                foreach ($staff as $user) {
                    $user->notify(new LowStockNotification($material, $currentStock));
                }
            }
        }
    }
}
