<?php

namespace Modules\Cooperative\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class VoteModel extends Model
{
    use HasUuids;

    protected $table = 'votes';

    public $timestamps = false;

    protected $fillable = [
        'meeting_id',
        'user_id',
        'resolution_code',
        'resolution_type',
        'choice',
        'weight',
        'created_at',
    ];

    protected $casts = [
        'weight' => 'decimal:4',
        'created_at' => 'datetime',
    ];

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(MeetingModel::class, 'meeting_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'user_id');
    }
}
