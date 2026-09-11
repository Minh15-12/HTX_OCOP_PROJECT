<?php

namespace Modules\Ocop\Dossier\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\IndicatorModel;

class SelfAssessmentModel extends Model
{
    protected $table = 'self_assessments';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'application_id',
        'indicator_id',
        'score',
        'explanation',
        'status',
    ];

    protected $casts = [
        'score' => 'float',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(OcopApplicationModel::class, 'application_id');
    }

    public function indicator(): BelongsTo
    {
        return $this->belongsTo(IndicatorModel::class, 'indicator_id');
    }
}
