<?php

namespace Modules\Report\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class ReportRequestModel extends Model
{
    protected $table = 'report_requests';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'report_type',
        'filters',
        'requested_by',
        'status',
        'requested_at',
        'completed_at',
        'error_message',
    ];

    protected $casts = [
        'filters' => 'array',
        'requested_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'requested_by');
    }
}
