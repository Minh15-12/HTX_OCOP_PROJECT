<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockCountLineModel extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'stock_count_lines';

    protected $fillable = [
        'stock_count_id',
        'material_id',
        'expected_quantity',
        'actual_quantity',
        'difference',
        'reason',
    ];

    protected $casts = [
        'expected_quantity' => 'decimal:4',
        'actual_quantity' => 'decimal:4',
        'difference' => 'decimal:4',
    ];

    public function stockCount(): BelongsTo
    {
        return $this->belongsTo(StockCountModel::class, 'stock_count_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(MaterialModel::class, 'material_id');
    }
}
