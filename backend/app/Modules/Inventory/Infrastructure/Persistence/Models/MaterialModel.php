<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;

class MaterialModel extends Model
{
    use HasUuids;

    protected $table = 'materials';

    protected $fillable = [
        'cooperative_id',
        'sku',
        'name',
        'category',
        'account_code',
        'is_durable_tool',
        'unit',
        'safety_information',
        'reorder_threshold',
        'status',
    ];

    protected $casts = [
        'is_durable_tool' => 'boolean',
        'safety_information' => 'array',
        'reorder_threshold' => 'decimal:4',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function batches(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MaterialBatchModel::class, 'material_id');
    }
}
