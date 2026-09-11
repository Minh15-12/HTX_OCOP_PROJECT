<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class StockReceiptModel extends Model
{
    use HasUuids;

    protected $table = 'stock_receipts';

    protected $fillable = [
        'cooperative_id',
        'receipt_number',
        'supplier_information',
        'receipt_date',
        'status',
        'total_amount',
        'evidence_reference',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'receipt_date' => 'date:Y-m-d',
        'total_amount' => 'decimal:2',
        'supplier_information' => 'array',
        'evidence_reference' => 'array',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'approved_by');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(StockReceiptLineModel::class, 'stock_receipt_id');
    }
}
