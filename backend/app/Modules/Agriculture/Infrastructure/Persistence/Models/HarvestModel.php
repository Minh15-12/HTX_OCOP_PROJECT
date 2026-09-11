<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class HarvestModel extends Model
{
    use HasUuids;

    protected $table = 'harvests';

    protected $fillable = [
        'crop_season_id',
        'plot_id',
        'harvest_date',
        'quantity',
        'unit',
        'quality_information',
        'lot_id',
    ];

    protected $casts = [
        'harvest_date' => 'date:Y-m-d',
        'quantity' => 'decimal:4',
        'quality_information' => 'array',
    ];

    public function cropSeason(): BelongsTo
    {
        return $this->belongsTo(CropSeasonModel::class, 'crop_season_id');
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(FarmPlotModel::class, 'plot_id');
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(LotModel::class, 'lot_id');
    }
}
