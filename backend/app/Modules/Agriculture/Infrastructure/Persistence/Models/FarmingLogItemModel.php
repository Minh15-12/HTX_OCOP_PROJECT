<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class FarmingLogItemModel extends Model
{
    use HasUuids;

    protected $table = 'farming_log_items';

    protected $fillable = [
        'farming_log_id',
        'material_id',
        'material_name',
        'item_type',
        'active_ingredient',
        'resistance_group',
        'quantity_applied',
        'unit',
        'phi_days',
        'material_lot_number',
        'material_export_slip_code',
    ];

    protected $casts = [
        'quantity_applied' => 'decimal:4',
        'phi_days' => 'integer',
    ];

    public function farmingLog(): BelongsTo
    {
        return $this->belongsTo(FarmingLogModel::class, 'farming_log_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(MaterialModel::class, 'material_id');
    }
}
