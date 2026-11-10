<?php

namespace App\Shared\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;

class IdempotencyKeyModel extends Model
{
    protected $table = 'idempotency_keys';

    protected $primaryKey = 'idempotency_key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'idempotency_key',
        'request_path',
        'response_code',
        'response_body',
        'expires_at',
    ];

    protected $casts = [
        'response_body' => 'array',
        'expires_at' => 'datetime',
    ];
}
