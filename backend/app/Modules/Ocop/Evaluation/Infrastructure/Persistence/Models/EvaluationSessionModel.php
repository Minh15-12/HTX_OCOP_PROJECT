<?php

namespace Modules\Ocop\Evaluation\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CouncilLevelModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;

class EvaluationSessionModel extends Model
{
    protected $table = 'evaluation_sessions';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'application_id',
        'council_level_id',
        'status',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(OcopApplicationModel::class, 'application_id');
    }

    public function councilLevel(): BelongsTo
    {
        return $this->belongsTo(CouncilLevelModel::class, 'council_level_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(EvaluatorAssignmentModel::class, 'evaluation_session_id');
    }

    public function consolidatedResult(): HasOne
    {
        return $this->hasOne(ConsolidatedResultModel::class, 'evaluation_session_id');
    }
}
