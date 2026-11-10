<?php

namespace App\Policies;

use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class CashTransactionPolicy
{
    /**
     * Determine if the user can view any cash transactions.
     */
    public function viewAny(UserModel $user): bool
    {
        return $user->hasPermission('FINANCE.READ') || $user->hasPermission('FINANCE.VIEW') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('ACCOUNTANT');
    }

    /**
     * Determine if the user can view the cash transaction.
     */
    public function view(UserModel $user, CashTransactionModel $transaction): bool
    {
        return ($user->hasPermission('FINANCE.READ') || $user->hasPermission('FINANCE.VIEW') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('ACCOUNTANT'))
            && $user->cooperative_id === $transaction->cooperative_id;
    }

    /**
     * Determine if the user can create cash transactions.
     */
    public function create(UserModel $user): bool
    {
        return $user->hasPermission('FINANCE.CREATE') || $user->hasPermission('FINANCE.TRANSACTION.CREATE') || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('ACCOUNTANT');
    }

    /**
     * Determine if the user can approve cash transactions.
     * SoD: ACCOUNTANT creates transactions and CANNOT self-approve. Approval requires HTX_OWNER or FINANCE.TRANSACTION.APPROVE.
     */
    public function approve(UserModel $user, CashTransactionModel $transaction): bool
    {
        return ($user->hasPermission('FINANCE.TRANSACTION.APPROVE') || $user->hasRole('HTX_OWNER'))
            && $user->cooperative_id === $transaction->cooperative_id;
    }

    /**
     * Determine if the user can post cash transactions.
     */
    public function post(UserModel $user, CashTransactionModel $transaction): bool
    {
        return ($user->hasPermission('FINANCE.POST') || $user->hasRole('HTX_OWNER') || $user->hasRole('ACCOUNTANT'))
            && $user->cooperative_id === $transaction->cooperative_id;
    }
}
