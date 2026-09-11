<?php

namespace Modules\Finance\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class CashTransactionModel extends Model
{
    use HasUuids;

    protected $table = 'cash_transactions';

    protected $fillable = [
        'cooperative_id',
        'voucher_number',
        'transaction_type',
        'amount',
        'transaction_date',
        'category',
        'description',
        'payer_payee',
        'member_id',
        'status',
        'evidence_reference',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'transaction_date' => 'date:Y-m-d',
        'amount' => 'decimal:2',
        'evidence_reference' => 'array',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(MemberModel::class, 'member_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'approved_by');
    }
}
