<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HarvestModel extends Model
{
    use HasUuids;

    protected $table = 'harvests';

    protected $fillable = [
        'crop_season_id',
        'plot_id',
        'stage_number',
        'harvest_date',
        'last_spray_date',
        'last_active_ingredient',
        'days_since_last_spray',
        'quantity',
        'rejection_weight_kg',
        'unit',
        'weighing_slip_code',
        'quality_information',
        'lot_id',
        'kcs_status',
        'kcs_gate_check',
        'kcs_quick_lab',
        'grade',
        'brix_level',
        'uniformity_rate',
        'is_over_quota',
        'quota_excess_kg',
        'quota_audit_status',
        'quota_audit_note',
    ];

    protected $casts = [
        'stage_number' => 'integer',
        'harvest_date' => 'date:Y-m-d',
        'last_spray_date' => 'date:Y-m-d',
        'days_since_last_spray' => 'integer',
        'quantity' => 'decimal:4',
        'rejection_weight_kg' => 'decimal:2',
        'quality_information' => 'array',
        'kcs_gate_check' => 'array',
        'kcs_quick_lab' => 'array',
        'brix_level' => 'decimal:2',
        'uniformity_rate' => 'decimal:2',
        'is_over_quota' => 'boolean',
        'quota_excess_kg' => 'decimal:2',
    ];

    protected $appends = [
        'grade_a_kg',
        'grade_b_kg',
        'reject_kg',
    ];

    public function getGradeAKgAttribute(): float
    {
        if ($this->grade !== 'GRADE_A') {
            return 0.0;
        }
        if (isset($this->quality_information['grade_a_kg'])) {
            return (float) $this->quality_information['grade_a_kg'];
        }

        return (float) $this->quantity;
    }

    public function getGradeBKgAttribute(): float
    {
        if (isset($this->quality_information['grade_b_kg'])) {
            return (float) $this->quality_information['grade_b_kg'];
        }

        return $this->grade === 'GRADE_B' ? (float) $this->quantity : 0.0;
    }

    public function getRejectKgAttribute(): float
    {
        if (isset($this->quality_information['reject_kg'])) {
            return (float) $this->quality_information['reject_kg'];
        }

        return $this->grade === 'REJECT' ? (float) $this->quantity : 0.0;
    }

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
