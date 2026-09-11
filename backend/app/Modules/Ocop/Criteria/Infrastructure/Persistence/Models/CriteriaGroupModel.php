<?php

namespace Modules\Ocop\Criteria\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CriteriaGroupModel extends Model
{
    protected $table = 'criteria_groups';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'criteria_version_id',
        'code',
        'name',
        'description',
        'display_order',
    ];

    protected $casts = [
        'display_order' => 'integer',
    ];

    public function version(): BelongsTo
    {
        return $this->belongsTo(CriteriaVersionModel::class, 'criteria_version_id');
    }

    public function criteria(): HasMany
    {
        return $this->hasMany(CriterionModel::class, 'criteria_group_id')->orderBy('display_order');
    }
}
