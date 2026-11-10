<?php

namespace App\Policies;

use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class MemberPolicy
{
    /**
     * Determine if the user can view any members.
     */
    public function viewAny(UserModel $user): bool
    {
        return $user->hasPermission('MEMBER.READ') || $user->hasPermission('MEMBER.VIEW') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF') || $user->hasRole('ACCOUNTANT');
    }

    /**
     * Determine if the user can view the member.
     */
    public function view(UserModel $user, MemberModel $member): bool
    {
        return ($user->hasPermission('MEMBER.READ') || $user->hasPermission('MEMBER.VIEW') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF') || $user->hasRole('ACCOUNTANT'))
            && $user->cooperative_id === $member->cooperative_id;
    }

    /**
     * Determine if the user can create members.
     */
    public function create(UserModel $user): bool
    {
        return $user->hasPermission('MEMBER.CREATE') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF');
    }

    /**
     * Determine if the user can update the member.
     */
    public function update(UserModel $user, MemberModel $member): bool
    {
        return ($user->hasPermission('MEMBER.UPDATE') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF'))
            && $user->cooperative_id === $member->cooperative_id;
    }

    /**
     * Determine if the user can approve the member.
     */
    public function approve(UserModel $user, MemberModel $member): bool
    {
        return ($user->hasPermission('MEMBER.APPROVE') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER'))
            && $user->cooperative_id === $member->cooperative_id;
    }

    /**
     * Determine if the user can delete the member.
     */
    public function delete(UserModel $user, MemberModel $member): bool
    {
        return ($user->hasPermission('MEMBER.DELETE') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER'))
            && $user->cooperative_id === $member->cooperative_id;
    }
}
