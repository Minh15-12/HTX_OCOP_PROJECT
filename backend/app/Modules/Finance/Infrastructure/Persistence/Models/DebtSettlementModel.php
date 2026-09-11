<?php

namespace Modules\Finance\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class DebtSettlementModel extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'debt_settlements';

    protected $fillable = [
        'debt_id',
        'settlement_date',
        'amount',
        'payment_method',
        'cash_transaction_id',
        'reference_number',
        'note',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'settlement_date' => 'date:Y-m-d',
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function debt(): BelongsTo
    {
        return $this->belongsTo(ReceivablePayableModel::class, 'debt_id');
    }

    public function cashTransaction(): BelongsTo
    {
        return $this->belongsTo(CashTransactionModel::class, 'cash_transaction_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'created_by');
    }
}
