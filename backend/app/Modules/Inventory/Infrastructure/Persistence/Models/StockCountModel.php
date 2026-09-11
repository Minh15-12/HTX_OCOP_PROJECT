<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class StockCountModel extends Model
{
    use HasUuids;

    protected $table = 'stock_counts';

    protected $fillable = [
        'cooperative_id',
        'count_number',
        'count_date',
        'scope',
        'status',
        'reason',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'count_date' => 'date:Y-m-d',
        'scope' => 'array',
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
        return $this->hasMany(StockCountLineModel::class, 'stock_count_id');
    }
}
