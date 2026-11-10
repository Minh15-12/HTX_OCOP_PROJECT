<?php

namespace Modules\Ocop\Evaluation\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class EvaluatorAssignmentModel extends Model
{
    protected $table = 'evaluator_assignments';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'evaluation_session_id',
        'evaluator_id',
        'role',
        'status',
        'assigned_at',
        'completed_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(EvaluationSessionModel::class, 'evaluation_session_id');
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'evaluator_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(EvaluatorScoreModel::class, 'assignment_id');
    }
}
