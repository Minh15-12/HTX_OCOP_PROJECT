<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class MaterialUsageModel extends Model
{
    use HasUuids;

    protected $table = 'material_usages';

    protected $fillable = [
        'farming_log_id',
        'material_id',
        'quantity',
        'unit',
        'batch_reference',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
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
