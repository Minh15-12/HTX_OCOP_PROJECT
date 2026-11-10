<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class WarehouseModel extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'warehouses';

    protected $fillable = [
        'cooperative_id',
        'warehouse_code',
        'name',
        'location',
        'manager_id',
        'status',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'manager_id');
    }

    public function stockReceipts(): HasMany
    {
        return $this->hasMany(StockReceiptModel::class, 'warehouse_id');
    }

    public function stockIssues(): HasMany
    {
        return $this->hasMany(StockIssueModel::class, 'warehouse_id');
    }
}
