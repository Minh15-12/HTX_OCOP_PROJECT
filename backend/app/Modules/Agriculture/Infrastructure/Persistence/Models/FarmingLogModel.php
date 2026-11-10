<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class FarmingLogModel extends Model
{
    use HasUuids;

    protected $table = 'farming_logs';

    protected $fillable = [
        'crop_season_id',
        'plot_id',
        'activity_type',
        'fertigation_method',
        'ec_solution',
        'ec_drain',
        'ph_solution',
        'tank_composition',
        'pest_target',
        'pest_density',
        'active_ingredient',
        'resistance_group',
        'material_lot_number',
        'material_export_slip_code',
        'biocontrol_agent_name',
        'biocontrol_release_rate',
        'water_volume_liters',
        'application_equipment',
        'is_phi_cleared',
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
        'client_uuid',
        'status',
        'is_backdated',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'hash_sha256',
        'prev_hash',
        'gps_distance_to_edge_meters',
        'is_gps_verified',
        'voice_raw_text',
    ];

    protected $casts = [
        'activity_date' => 'date:Y-m-d',
        'attachment_reference' => 'array',
        'tank_composition' => 'array',
        'quantity_applied' => 'decimal:4',
        'ec_solution' => 'decimal:2',
        'ec_drain' => 'decimal:2',
        'ph_solution' => 'decimal:2',
        'water_volume_liters' => 'decimal:2',
        'phi_days' => 'integer',
        'is_phi_cleared' => 'boolean',
        'gps_latitude' => 'decimal:8',
        'gps_longitude' => 'decimal:8',
        'is_backdated' => 'boolean',
        'is_gps_verified' => 'boolean',
        'gps_distance_to_edge_meters' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(FarmingLogItemModel::class, 'farming_log_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'verified_by');
    }

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
        return $this->belongsTo(MaterialModel::class, 'material_id');
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
