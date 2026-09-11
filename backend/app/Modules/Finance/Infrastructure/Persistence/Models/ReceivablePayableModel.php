<?php

namespace Modules\Finance\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;

class ReceivablePayableModel extends Model
{
    use HasUuids;

    protected $table = 'receivable_payables';

    protected $fillable = [
        'cooperative_id',
        'debt_code',
        'debt_type',
        'counterparty_type',
        'counterparty_id',
        'counterparty_name',
        'original_amount',
        'outstanding_amount',
        'due_date',
        'status',
        'description',
    ];

    protected $casts = [
        'due_date' => 'date:Y-m-d',
        'original_amount' => 'decimal:2',
        'outstanding_amount' => 'decimal:2',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(DebtSettlementModel::class, 'debt_id');
    }
}
