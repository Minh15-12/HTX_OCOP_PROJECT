<?php

namespace Modules\Ocop\Criteria\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class CouncilLevelModel extends Model
{
    protected $table = 'council_levels';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'code',
        'name',
        'description',
        'sort_order',
        'is_active',
        'valid_from',
        'valid_to',
        'source_reference',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'source_reference' => 'array',
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];
}
