<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class FarmingLogModel extends Model
{
    use HasUuids;

    protected $table = 'farming_logs';

    protected $fillable = [
        'crop_season_id',
        'plot_id',
        'activity_type',
        'activity_date',
        'description',
        'performed_by',
        'attachment_reference',
        'material_id',
        'material_batch_number',
        'quantity_applied',
        'unit',
        'phi_days',
        'gps_latitude',
        'gps_longitude',
    ];

    protected $casts = [
        'activity_date' => 'date:Y-m-d',
        'attachment_reference' => 'array',
        'quantity_applied' => 'decimal:4',
        'phi_days' => 'integer',
        'gps_latitude' => 'decimal:8',
        'gps_longitude' => 'decimal:8',
    ];

    public function cropSeason(): BelongsTo
    {
        return $this->belongsTo(CropSeasonModel::class, 'crop_season_id');
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(FarmPlotModel::class, 'plot_id');
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'performed_by');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(\Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel::class, 'material_id');
    }

    public function materialUsages(): HasMany
    {
        return $this->hasMany(MaterialUsageModel::class, 'farming_log_id');
    }

    public function phiCalculations(): HasMany
    {
        return $this->hasMany(PhiCalculationModel::class, 'farming_log_id');
    }
}
