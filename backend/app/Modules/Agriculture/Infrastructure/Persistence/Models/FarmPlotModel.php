<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FarmPlotModel extends Model
{
    use HasUuids;

    protected $table = 'farm_plots';

    protected $fillable = [
        'production_unit_id',
        'plot_code',
        'land_relation',
        'area',
        'status',
        'quarantine_until',
        'national_cadastral_code',
        'land_sheet_number',
        'land_parcel_number',
        'substrate_bag_count',
        'planting_density_per_sqm',
        'greenhouse_type',
        'geometry_geojson',
        'vn2000_coordinates',
        'max_yield_rate_per_sqm',
        'land_contract_expired_at',
    ];

    protected $casts = [
        'area' => 'decimal:4',
        'planting_density_per_sqm' => 'decimal:2',
        'max_yield_rate_per_sqm' => 'decimal:2',
        'substrate_bag_count' => 'integer',
        'land_relation' => 'array',
        'geometry_geojson' => 'array',
        'vn2000_coordinates' => 'array',
        'quarantine_until' => 'date:Y-m-d',
        'land_contract_expired_at' => 'date:Y-m-d',
    ];

    /**
     * Tính toán sản lượng trần sinh thái tối đa của thửa đất trong một vụ mùa (kg)
     * Công thức: Area (m2) x Năng suất chuẩn (kg/m2) x (1 + Dung sai mùa vụ 20%)
     */
    public function calculateHarvestQuota(float $tolerance = 0.20): float
    {
        $area = (float) $this->area;
        $areaM2 = $area < 100 ? $area * 10000 : $area;
        $yieldRate = (float) ($this->max_yield_rate_per_sqm ?? 5.00);
        return round($areaM2 * $yieldRate * (1.0 + $tolerance), 2);
    }

    /**
     * Lấy tổng sản lượng đã thu hoạch tích lũy của thửa đất trong một vụ mùa
     */
    public function getAccumulatedHarvestYield(string $seasonId): float
    {
        return (float) HarvestModel::where('plot_id', $this->id)
            ->where('crop_season_id', $seasonId)
            ->sum('quantity');
    }

    public function isInQuarantine(?string $checkDate = null): bool
    {
        $date = $checkDate ? \Carbon\Carbon::parse($checkDate) : now();
        if ($this->status === 'IN_QUARANTINE') {
            return true;
        }
        if ($this->quarantine_until && $date->lessThanOrEqualTo($this->quarantine_until)) {
            return true;
        }
        return false;
    }

    public function productionUnit(): BelongsTo
    {
        return $this->belongsTo(ProductionUnitModel::class, 'production_unit_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(MemberPlotAssignmentModel::class, 'plot_id');
    }

    public function memberAssignments(): HasMany
    {
        return $this->assignments();
    }
}
