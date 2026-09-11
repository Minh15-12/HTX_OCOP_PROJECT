<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class PhiCalculationModel extends Model
{
    use HasUuids;

    public $timestamps = false; // Only created_at in schema

    protected $table = 'phi_calculations';

    protected $fillable = [
        'farming_log_id',
        'material_id',
        'application_date',
        'configured_phi_days',
        'safety_date',
        'status',
        'source_reference',
        'created_at',
    ];

    protected $casts = [
        'application_date' => 'date:Y-m-d',
        'safety_date' => 'date:Y-m-d',
        'configured_phi_days' => 'integer',
        'source_reference' => 'array',
        'created_at' => 'datetime',
    ];

    public function farmingLog(): BelongsTo
    {
        return $this->belongsTo(FarmingLogModel::class, 'farming_log_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(MaterialModel::class, 'material_id');
    }
}
