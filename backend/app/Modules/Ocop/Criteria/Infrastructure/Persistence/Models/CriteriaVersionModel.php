<?php

namespace Modules\Ocop\Criteria\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CriteriaVersionModel extends Model
{
    protected $table = 'criteria_versions';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'version_code',
        'name',
        'effective_from',
        'effective_to',
        'source_reference',
        'status',
    ];

    protected $casts = [
        'source_reference' => 'array',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    public function groups(): HasMany
    {
        return $this->hasMany(CriteriaGroupModel::class, 'criteria_version_id')->orderBy('display_order');
    }

    public function scoringRules(): HasMany
    {
        return $this->hasMany(ScoringRuleModel::class, 'criteria_version_id');
    }

    public function mandatoryConditions(): HasMany
    {
        return $this->hasMany(MandatoryConditionModel::class, 'criteria_version_id');
    }
}
