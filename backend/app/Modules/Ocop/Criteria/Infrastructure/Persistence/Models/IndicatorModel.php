<?php

namespace Modules\Ocop\Criteria\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndicatorModel extends Model
{
    protected $table = 'indicators';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'criterion_id',
        'code',
        'name',
        'description',
        'max_score',
        'mandatory',
        'evidence_requirement',
        'display_order',
    ];

    protected $casts = [
        'max_score' => 'float',
        'mandatory' => 'boolean',
        'evidence_requirement' => 'array',
        'display_order' => 'integer',
    ];

    public function criterion(): BelongsTo
    {
        return $this->belongsTo(CriterionModel::class, 'criterion_id');
    }
}
