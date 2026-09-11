<?php

namespace Modules\Ocop\Criteria\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CriterionModel extends Model
{
    protected $table = 'criteria';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'criteria_group_id',
        'code',
        'name',
        'description',
        'max_score',
        'mandatory',
        'display_order',
    ];

    protected $casts = [
        'max_score' => 'float',
        'mandatory' => 'boolean',
        'display_order' => 'integer',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(CriteriaGroupModel::class, 'criteria_group_id');
    }

    public function indicators(): HasMany
    {
        return $this->hasMany(IndicatorModel::class, 'criterion_id')->orderBy('display_order');
    }
}
