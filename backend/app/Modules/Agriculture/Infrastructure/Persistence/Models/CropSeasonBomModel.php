<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class CropSeasonBomModel extends Model
{
    use HasUuids;

    protected $table = 'crop_season_boms';

    protected $fillable = [
        'crop_season_id',
        'material_id',
        'stage_phase',
        'standard_rate_per_sqm',
        'planned_quantity',
        'issued_quantity',
        'estimated_unit_price',
        'estimated_total_cost',
        'notes',
    ];

    protected $casts = [
        'standard_rate_per_sqm' => 'decimal:4',
        'planned_quantity' => 'decimal:4',
        'issued_quantity' => 'decimal:4',
        'estimated_unit_price' => 'decimal:2',
        'estimated_total_cost' => 'decimal:2',
    ];

    public function cropSeason(): BelongsTo
    {
        return $this->belongsTo(CropSeasonModel::class, 'crop_season_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(MaterialModel::class, 'material_id');
    }
}
