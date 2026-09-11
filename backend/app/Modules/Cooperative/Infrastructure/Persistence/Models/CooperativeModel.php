<?php

namespace Modules\Cooperative\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CooperativeModel extends Model
{
    use HasUuids;

    protected $table = 'cooperatives';

    protected $fillable = [
        'cooperative_code',
        'legal_name',
        'display_name',
        'legal_information',
        'contact_information',
        'status',
    ];

    protected $casts = [
        'legal_information' => 'array',
        'contact_information' => 'array',
    ];
}
