<?php

namespace Modules\Ocop\Dossier\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\FinalDecisionModel;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;
use Modules\Product\Infrastructure\Persistence\Models\ProductModel;

class OcopApplicationModel extends Model
{
    protected $table = 'ocop_applications';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'cooperative_id',
        'product_id',
        'criteria_version_id',
        'application_number',
        'application_type',
        'status',
        'submitted_at',
        'completed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }

    public function criteriaVersion(): BelongsTo
    {
        return $this->belongsTo(CriteriaVersionModel::class, 'criteria_version_id');
    }

    public function selfAssessments(): HasMany
    {
        return $this->hasMany(SelfAssessmentModel::class, 'application_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ApplicationReviewModel::class, 'application_id');
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(EvidenceModel::class, 'application_id');
    }

    public function finalDecision(): HasOne
    {
        return $this->hasOne(FinalDecisionModel::class, 'application_id');
    }
}
