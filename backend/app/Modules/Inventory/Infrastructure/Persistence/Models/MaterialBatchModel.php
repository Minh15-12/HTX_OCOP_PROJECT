<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;

class MaterialBatchModel extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'material_batches';

    protected $fillable = [
        'cooperative_id',
        'material_id',
        'stock_receipt_line_id',
        'batch_number',
        'quantity',
        'initial_quantity',
        'manufactured_at',
        'expired_at',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'initial_quantity' => 'decimal:4',
        'manufactured_at' => 'date',
        'expired_at' => 'date',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(MaterialModel::class, 'material_id');
    }
}
