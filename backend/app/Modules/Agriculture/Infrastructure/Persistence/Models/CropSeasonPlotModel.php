<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;

class CropSeasonPlotModel extends Model
{
    use HasUuids;

    protected $table = 'crop_season_plots';

    protected $fillable = [
        'crop_season_id',
        'plot_id',
        'member_id',
        'allocated_area',
        'crop_variety',
        'planting_date',
        'expected_harvest_start',
        'expected_harvest_end',
        'target_yield_kg',
        'actual_harvested_kg',
        'status',
        'notes',
    ];

    protected $casts = [
        'allocated_area' => 'decimal:2',
        'target_yield_kg' => 'decimal:2',
        'actual_harvested_kg' => 'decimal:2',
        'planting_date' => 'date:Y-m-d',
        'expected_harvest_start' => 'date:Y-m-d',
        'expected_harvest_end' => 'date:Y-m-d',
    ];

    public function cropSeason(): BelongsTo
    {
        return $this->belongsTo(CropSeasonModel::class, 'crop_season_id');
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(FarmPlotModel::class, 'plot_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(MemberModel::class, 'member_id');
    }
}
