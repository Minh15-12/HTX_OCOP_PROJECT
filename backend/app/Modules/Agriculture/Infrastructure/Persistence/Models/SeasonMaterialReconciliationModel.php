<?php

namespace Modules\Agriculture\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class SeasonMaterialReconciliationModel extends Model
{
    use HasUuids;

    protected $table = 'season_material_reconciliations';

    protected $fillable = [
        'cooperative_id',
        'crop_season_id',
        'material_id',
        'material_name',
        'unit',
        'opening_balance',
        'received_from_coop',
        'used_in_logbook',
        'actual_closing_balance',
        'variance',
        'empty_packaging_returned',
        'waste_disposal_slip_code',
        'reconciliation_notes',
        'status',
        'reconciled_by',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:4',
        'received_from_coop' => 'decimal:4',
        'used_in_logbook' => 'decimal:4',
        'actual_closing_balance' => 'decimal:4',
        'variance' => 'decimal:4',
        'empty_packaging_returned' => 'integer',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function cropSeason(): BelongsTo
    {
        return $this->belongsTo(CropSeasonModel::class, 'crop_season_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(MaterialModel::class, 'material_id');
    }

    public function reconciler(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'reconciled_by');
    }
}
