<?php

namespace Modules\Ocop\Evidence\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class EvidenceVersionModel extends Model
{
    protected $table = 'evidence_versions';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false; // Uses uploaded_at column

    protected $fillable = [
        'id',
        'evidence_id',
        'version_number',
        'file_reference',
        'file_name',
        'checksum',
        'mime_type',
        'file_size',
        'uploaded_by',
        'uploaded_at',
        'replacement_reason',
    ];

    protected $casts = [
        'version_number' => 'integer',
        'file_size' => 'integer',
        'uploaded_at' => 'datetime',
    ];

    public function evidence(): BelongsTo
    {
        return $this->belongsTo(EvidenceModel::class, 'evidence_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'uploaded_by');
    }
}
