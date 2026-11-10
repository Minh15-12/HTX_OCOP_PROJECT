<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class MemberToolTrackingModel extends Model
{
    use HasUuids;

    protected $table = 'member_tool_trackings';

    protected $fillable = [
        'cooperative_id',
        'member_id',
        'farm_plot_id',
        'material_id',
        'serial_number',
        'quantity',
        'status', // IN_USE, MAINTENANCE, DAMAGED_RETURNED, LOST
        'assigned_date',
        'returned_date',
        'note',
        'created_by',
    ];

    protected $casts = [
        'assigned_date' => 'date:Y-m-d',
        'returned_date' => 'date:Y-m-d',
        'quantity' => 'integer',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(MemberModel::class, 'member_id');
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(FarmPlotModel::class, 'farm_plot_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(MaterialModel::class, 'material_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'created_by');
    }
}
