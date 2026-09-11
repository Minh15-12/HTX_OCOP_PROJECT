<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockReceiptLineModel extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'stock_receipt_lines';

    protected $fillable = [
        'stock_receipt_id',
        'material_id',
        'quantity',
        'unit_price',
        'batch_code',
        'expiry_date',
        'line_amount',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price' => 'decimal:2',
        'line_amount' => 'decimal:2',
        'expiry_date' => 'date:Y-m-d',
    ];

    public function stockReceipt(): BelongsTo
    {
        return $this->belongsTo(StockReceiptModel::class, 'stock_receipt_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(MaterialModel::class, 'material_id');
    }
}
