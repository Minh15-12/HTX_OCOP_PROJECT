<?php

namespace Modules\Ocop\Evaluation\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;

class EvaluatorScoreModel extends Model
{
    protected $table = 'evaluator_scores';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'assignment_id',
        'indicator_id',
        'score',
        'comment',
        'submitted_at',
        'locked_at',
    ];

    protected $casts = [
        'score' => 'float',
        'submitted_at' => 'datetime',
        'locked_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(EvaluatorAssignmentModel::class, 'assignment_id');
    }

    public function indicator(): BelongsTo
    {
        return $this->belongsTo(IndicatorModel::class, 'indicator_id');
    }
}
