<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;

class ProductionUnitModel extends Model
{
    use HasUuids;

    protected $table = 'production_units';

    protected $fillable = [
        'cooperative_id',
        'unit_code',
        'name',
        'crop',
        'area',
        'location',
        'status',
        'registration_information',
    ];

    protected $casts = [
        'area' => 'decimal:4',
        'location' => 'array',
        'registration_information' => 'array',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function plots(): HasMany
    {
        return $this->hasMany(FarmPlotModel::class, 'production_unit_id');
    }
}
