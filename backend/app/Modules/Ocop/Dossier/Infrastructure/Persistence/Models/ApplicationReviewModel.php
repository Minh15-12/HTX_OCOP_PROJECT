<?php

namespace Modules\Ocop\Dossier\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class ApplicationReviewModel extends Model
{
    protected $table = 'application_reviews';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'application_id',
        'reviewer_id',
        'review_status',
        'comments',
        'requested_revision',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(OcopApplicationModel::class, 'application_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'reviewer_id');
    }
}
