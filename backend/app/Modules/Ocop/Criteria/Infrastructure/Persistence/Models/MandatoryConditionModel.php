<?php

namespace Modules\Ocop\Criteria\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MandatoryConditionModel extends Model
{
    protected $table = 'mandatory_conditions';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'criteria_version_id',
        'condition_code',
        'name',
        'description',
        'condition_type',
        'configuration',
        'blocking',
    ];

    protected $casts = [
        'configuration' => 'array',
        'blocking' => 'boolean',
    ];

    public function version(): BelongsTo
    {
        return $this->belongsTo(CriteriaVersionModel::class, 'criteria_version_id');
    }
}
