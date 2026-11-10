<?php

namespace Modules\Cooperative\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CapitalContributionModel extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'capital_contributions';

    protected $fillable = [
        'member_id',
        'contribution_type',
        'amount',
        'committed_amount',
        'actual_amount',
        'ownership_ratio',
        'value_description',
        'transaction_date',
        'evidence_reference',
        'status',
        'certificate_code',
        'certificate_issue_date',
        'issue_count',
        'valuation_ref_doc',
        'qr_code_url',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'committed_amount' => 'decimal:2',
        'actual_amount' => 'decimal:2',
        'ownership_ratio' => 'decimal:2',
        'transaction_date' => 'date:Y-m-d',
        'certificate_issue_date' => 'date:Y-m-d',
        'evidence_reference' => 'array',
        'issue_count' => 'integer',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(MemberModel::class, 'member_id');
    }

    public function landContribution()
    {
        return $this->hasOne(LandContributionModel::class, 'contribution_id');
    }
}
