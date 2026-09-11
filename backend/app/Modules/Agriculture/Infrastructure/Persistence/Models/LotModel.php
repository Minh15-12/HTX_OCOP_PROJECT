<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LotModel extends Model
{
    use HasUuids;

    protected $table = 'lots';

    protected $fillable = [
        'lot_code',
        'harvest_id',
        'source_information',
        'quantity',
        'unit',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'source_information' => 'array',
    ];

    public function harvest(): BelongsTo
    {
        return $this->belongsTo(HarvestModel::class, 'harvest_id');
    }
}
