<?php

namespace Modules\Product\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Modules\Agriculture\Infrastructure\Persistence\Models\LotModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;

class ProductModel extends Model
{
    use HasUuids;

    protected $table = 'products';

    protected $fillable = [
        'cooperative_id',
        'product_code',
        'product_name',
        'category',
        'specification',
        'brand',
        'quality_information',
        'status',
    ];

    protected $casts = [
        'specification' => 'array',
        'quality_information' => 'array',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function lots(): BelongsToMany
    {
        return $this->belongsToMany(LotModel::class, 'product_lots', 'product_id', 'lot_id')
            ->withPivot('quantity', 'created_at');
    }
}
