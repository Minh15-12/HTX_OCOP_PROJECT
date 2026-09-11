<?php

namespace Modules\Ocop\Evaluation\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;

class ProposedClassificationModel extends Model
{
    protected $table = 'proposed_classifications';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'application_id',
        'result_id',
        'proposed_level',
        'rule_version_reference',
        'reason',
        'status',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(OcopApplicationModel::class, 'application_id');
    }

    public function result(): BelongsTo
    {
        return $this->belongsTo(ConsolidatedResultModel::class, 'result_id');
    }
}
