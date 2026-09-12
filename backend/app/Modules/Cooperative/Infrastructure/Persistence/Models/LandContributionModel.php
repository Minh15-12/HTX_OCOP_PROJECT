<?php

namespace Modules\Cooperative\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandContributionModel extends Model
{
    use HasUuids;

    protected $table = 'land_contributions';

    protected $fillable = [
        'contribution_id',
        'land_certificate_no',
        'plot_number',
        'map_sheet_number',
        'land_area_sqm',
        'land_use_type',
        'appraised_unit_price',
        'total_land_value',
        'cadastral_status',
    ];

    protected $casts = [
        'land_area_sqm' => 'decimal:2',
        'appraised_unit_price' => 'decimal:2',
        'total_land_value' => 'decimal:2',
    ];

    public function contribution(): BelongsTo
    {
        return $this->belongsTo(CapitalContributionModel::class, 'contribution_id');
    }
}
