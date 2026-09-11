<?php

namespace Modules\Audit\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditEventModel extends Model
{
    use HasUuids;

    protected $table = 'audit_events';

    public $timestamps = false;

    protected $fillable = [
        'actor_id',
        'action',
        'entity_type',
        'entity_id',
        'before_reference',
        'after_reference',
        'cooperative_id',
        'ip_address',
        'request_id',
        'created_at',
    ];

    protected $casts = [
        'before_reference' => 'array',
        'after_reference' => 'array',
        'created_at' => 'datetime',
    ];
}
