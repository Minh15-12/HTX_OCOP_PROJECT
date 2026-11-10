<?php

namespace Modules\Identity\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;

class UserModel extends Authenticatable
{
    use HasApiTokens, HasUuids, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'username',
        'email',
        'password',
        'full_name',
        'phone_number',
        'cooperative_id',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(CooperativeModel::class, 'cooperative_id');
    }

    public function member(): HasOne
    {
        return $this->hasOne(MemberModel::class, 'user_id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            RoleModel::class,
            'user_roles',
            'user_id',
            'role_id'
        );
    }

    public function hasRole(string $roleCode): bool
    {
        return $this->roles->contains('code', $roleCode);
    }

    public function hasPermission(string $permissionCode): bool
    {
        foreach ($this->roles as $role) {
            if ($role->permissions->contains('code', $permissionCode)) {
                return true;
            }
        }

        return false;
    }
}
