<?php

namespace Modules\Finance\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;

class SurplusDistributionAllocationModel extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'surplus_distribution_allocations';

    protected $fillable = [
        'plan_id',
        'member_id',
        'capital_contribution_snapshot',
        'service_usage_snapshot',
        'capital_share_amount',
        'service_share_amount',
        'total_allocated_amount',
    ];

    protected $casts = [
        'capital_contribution_snapshot' => 'decimal:2',
        'service_usage_snapshot' => 'decimal:2',
        'capital_share_amount' => 'decimal:2',
        'service_share_amount' => 'decimal:2',
        'total_allocated_amount' => 'decimal:2',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SurplusDistributionPlanModel::class, 'plan_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(MemberModel::class, 'member_id');
    }
}
