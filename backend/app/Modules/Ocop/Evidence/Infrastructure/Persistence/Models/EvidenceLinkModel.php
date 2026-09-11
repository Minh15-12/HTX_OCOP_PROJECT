<?php

namespace Modules\Ocop\Evidence\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;

class EvidenceLinkModel extends Model
{
    protected $table = 'evidence_links';

    public $incrementing = false;

    public $timestamps = false; // Uses created_at column

    protected $fillable = [
        'evidence_id',
        'indicator_id',
        'relevance',
        'note',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function evidence(): BelongsTo
    {
        return $this->belongsTo(EvidenceModel::class, 'evidence_id');
    }

    public function indicator(): BelongsTo
    {
        return $this->belongsTo(IndicatorModel::class, 'indicator_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'created_by');
    }
}
