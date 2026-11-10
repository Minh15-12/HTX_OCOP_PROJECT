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
        'seed_supplier',
        'seedling_standard_checklist',
        'buyer_contract_info',
        'puc_quota_kg',
        'logbook_status',
        'logbook_frozen_at',
        'logbook_final_hash',
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
        'logbook_frozen_at' => 'datetime',
        'puc_quota_kg' => 'decimal:2',
        'seedling_standard_checklist' => 'array',
        'buyer_contract_info' => 'array',
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

    public function harvests(): HasMany
    {
        return $this->hasMany(HarvestModel::class, 'crop_season_id');
    }

    public function reconciliations(): HasMany
    {
        return $this->hasMany(SeasonMaterialReconciliationModel::class, 'crop_season_id');
    }

    public function allocatedPlots(): HasMany
    {
        return $this->hasMany(CropSeasonPlotModel::class, 'crop_season_id');
    }

    public function boms(): HasMany
    {
        return $this->hasMany(CropSeasonBomModel::class, 'crop_season_id');
    }

    public function getTotalAllocatedAreaAttribute(): float
    {
        return (float) $this->allocatedPlots()->sum('allocated_area');
    }

    public function getTotalTargetYieldAttribute(): float
    {
        return (float) $this->allocatedPlots()->sum('target_yield_kg');
    }

    public function getTotalActualHarvestedAttribute(): float
    {
        return (float) $this->allocatedPlots()->sum('actual_harvested_kg');
    }

    public function getEstimatedTotalBudgetAttribute(): float
    {
        return (float) $this->boms()->sum('estimated_total_cost');
    }
}
