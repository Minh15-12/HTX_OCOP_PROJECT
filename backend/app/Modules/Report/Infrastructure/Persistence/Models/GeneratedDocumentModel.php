<?php

namespace Modules\Report\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class GeneratedDocumentModel extends Model
{
    protected $table = 'generated_documents';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'document_type',
        'source_entity_type',
        'source_entity_id',
        'template_version',
        'source_data_version',
        'file_reference',
        'checksum',
        'generated_at',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
    ];
}
