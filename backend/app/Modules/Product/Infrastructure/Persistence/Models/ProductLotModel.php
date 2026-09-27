<?php

namespace Modules\Product\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class ProductLotModel extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $table = 'product_lots';

    protected $fillable = [
        'product_id',
        'lot_id',
        'quantity',
        'created_at',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'created_at' => 'datetime',
    ];
}
