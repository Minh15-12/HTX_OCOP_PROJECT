<?php

namespace Modules\Identity\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PermissionModel extends Model
{
    use HasUuids;

    protected $table = 'permissions';

    protected $fillable = [
        'code',
        'name',
        'description',
        'module',
    ];
}
