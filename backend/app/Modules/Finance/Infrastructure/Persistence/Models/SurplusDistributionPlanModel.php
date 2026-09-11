<?php

namespace Modules\Finance\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class SurplusDistributionPlanModel extends Model
{
    use HasUuids;

    protected $table = 'surplus_distribution_plans';

    protected $fillable = [
        'cooperative_id',
        'plan_code',
        'financial_year',
        'total_surplus',
        'distributable_surplus',
        'capital_weight',
        'service_usage_weight',
        'status',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'financial_year' => 'integer',
        'total_surplus' => 'decimal:2',
        'distributable_surplus' => 'decimal:2',
        'capital_weight' => 'decimal:2',
        'service_usage_weight' => 'decimal:2',
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

    public function allocations(): HasMany
    {
        return $this->hasMany(SurplusDistributionAllocationModel::class, 'plan_id');
    }
}
