<?php

namespace Modules\Ocop\Criteria\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScoringRuleModel extends Model
{
    protected $table = 'scoring_rules';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'criteria_version_id',
        'rule_code',
        'rule_type',
        'configuration',
        'priority',
        'status',
    ];

    protected $casts = [
        'configuration' => 'array',
        'priority' => 'integer',
    ];

    public function version(): BelongsTo
    {
        return $this->belongsTo(CriteriaVersionModel::class, 'criteria_version_id');
    }
}
