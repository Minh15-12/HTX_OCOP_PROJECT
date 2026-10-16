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
    ];

    protected $casts = [
        'area' => 'decimal:4',
        'land_relation' => 'array',
        'quarantine_until' => 'date:Y-m-d',
    ];

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
