<?php

namespace Modules\Cooperative\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeetingModel extends Model
{
    use HasUuids;

    protected $table = 'meetings';

    protected $fillable = [
        'cooperative_id',
        'meeting_type',
        'meeting_date',
        'title',
        'description',
        'status',
    ];

    protected $casts = [
        'meeting_date' => 'date:Y-m-d',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(VoteModel::class, 'meeting_id');
    }
}
