<?php

namespace Modules\Ocop\Evaluation\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;

class ConsolidatedResultModel extends Model
{
    protected $table = 'consolidated_results';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'application_id',
        'evaluation_session_id',
        'total_score',
        'rule_version_reference',
        'consolidation_status',
        'calculated_at',
    ];

    protected $casts = [
        'total_score' => 'float',
        'calculated_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(OcopApplicationModel::class, 'application_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(EvaluationSessionModel::class, 'evaluation_session_id');
    }

    public function proposedClassification(): HasOne
    {
        return $this->hasOne(ProposedClassificationModel::class, 'result_id');
    }
}
