<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CropSeasonModel extends Model
{
    use HasUuids;

    protected $table = 'crop_seasons';

    protected $fillable = [
        'production_unit_id',
        'name',
        'crop',
        'start_date',
        'expected_end_date',
        'actual_end_date',
        'status',
        'plan_information',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'expected_end_date' => 'date:Y-m-d',
        'actual_end_date' => 'date:Y-m-d',
        'plan_information' => 'array',
    ];

    public function productionUnit(): BelongsTo
    {
        return $this->belongsTo(ProductionUnitModel::class, 'production_unit_id');
    }

    public function farmingLogs(): HasMany
    {
        return $this->hasMany(FarmingLogModel::class, 'crop_season_id');
    }
}
