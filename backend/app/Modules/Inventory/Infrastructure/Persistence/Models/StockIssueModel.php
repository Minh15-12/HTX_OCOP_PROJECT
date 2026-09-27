<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class StockIssueModel extends Model
{
    use HasUuids;

    protected $table = 'stock_issues';

    protected $fillable = [
        'cooperative_id',
        'issue_number',
        'issue_date',
        'member_id',
        'is_credit',
        'purpose',
        'status',
        'total_amount',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'issue_date' => 'date:Y-m-d',
        'total_amount' => 'decimal:2',
        'is_credit' => 'boolean',
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

    public function lines(): HasMany
    {
        return $this->hasMany(StockIssueLineModel::class, 'stock_issue_id');
    }
}
