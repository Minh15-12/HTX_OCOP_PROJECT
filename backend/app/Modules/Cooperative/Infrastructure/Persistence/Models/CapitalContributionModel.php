<?php

namespace Modules\Cooperative\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CapitalContributionModel extends Model
{
    use HasUuids;

    protected $table = 'capital_contributions';

    protected $fillable = [
        'member_id',
        'contribution_type',
        'amount',
        'value_description',
        'transaction_date',
        'evidence_reference',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date:Y-m-d',
        'evidence_reference' => 'array',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(MemberModel::class, 'member_id');
    }
}
