<?php

namespace App\Policies;

use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;

class InventoryPolicy
{
    /**
     * Determine if the user can view any inventory materials.
     */
    public function viewAny(UserModel $user): bool
    {
        return $user->hasPermission('INVENTORY.VIEW') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF') || $user->hasRole('STOREKEEPER');
    }

    /**
     * Determine if the user can view the material.
     */
    public function view(UserModel $user, MaterialModel $material): bool
    {
        return ($user->hasPermission('INVENTORY.VIEW') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF') || $user->hasRole('STOREKEEPER'))
            && $user->cooperative_id === $material->cooperative_id;
    }

    /**
     * Determine if the user can create materials or receipts.
     */
    public function create(UserModel $user): bool
    {
        return $user->hasPermission('INVENTORY.CREATE') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF') || $user->hasRole('STOREKEEPER');
    }

    /**
     * Determine if the user can update the material.
     */
    public function update(UserModel $user, MaterialModel $material): bool
    {
        return ($user->hasPermission('INVENTORY.UPDATE') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF') || $user->hasRole('STOREKEEPER'))
            && $user->cooperative_id === $material->cooperative_id;
    }

    /**
     * Determine if the user can approve stock movements.
     */
    public function approve(UserModel $user, MaterialModel $material): bool
    {
        return ($user->hasPermission('INVENTORY.APPROVE') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('STOREKEEPER'))
            && $user->cooperative_id === $material->cooperative_id;
    }
}
