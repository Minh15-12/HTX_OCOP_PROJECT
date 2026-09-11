<?php

namespace Modules\Ocop\Evidence\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;

class EvidenceModel extends Model
{
    protected $table = 'evidences';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'application_id',
        'title',
        'evidence_type',
        'source_type',
        'status',
        'current_version_id',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(OcopApplicationModel::class, 'application_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(EvidenceVersionModel::class, 'evidence_id')->orderBy('version_number', 'asc');
    }

    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(EvidenceVersionModel::class, 'current_version_id');
    }

    public function verifiedUser(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'verified_by');
    }

    public function indicators(): BelongsToMany
    {
        return $this->belongsToMany(
            IndicatorModel::class,
            'evidence_links',
            'evidence_id',
            'indicator_id'
        )->withPivot(['relevance', 'note', 'created_by', 'created_at']);
    }
}
