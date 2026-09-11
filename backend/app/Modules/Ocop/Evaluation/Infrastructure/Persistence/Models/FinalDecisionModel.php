<?php

namespace Modules\Ocop\Evaluation\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;

class FinalDecisionModel extends Model
{
    protected $table = 'final_decisions';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'application_id',
        'authority_reference',
        'decision_number',
        'decision_date',
        'final_classification',
        'effective_date',
        'document_reference',
        'status',
    ];

    protected $casts = [
        'authority_reference' => 'array',
        'document_reference' => 'array',
        'decision_date' => 'date',
        'effective_date' => 'date',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(OcopApplicationModel::class, 'application_id');
    }
}
