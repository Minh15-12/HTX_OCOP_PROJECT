<?php

namespace Modules\Cooperative\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class MemberModel extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'members';

    protected $fillable = [
        'cooperative_id',
        'member_code',
        'user_id',
        'identity_information',
        'member_type',
        'status',
        'admission_date',
        'termination_date',
    ];

    protected $casts = [
        'identity_information' => 'array',
        'admission_date' => 'date:Y-m-d',
        'termination_date' => 'date:Y-m-d',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'user_id');
    }
}
