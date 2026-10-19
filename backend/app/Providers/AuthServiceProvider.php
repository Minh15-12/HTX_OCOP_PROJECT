<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        \Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel::class => \App\Policies\MemberPolicy::class,
        \Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel::class => \App\Policies\OcopApplicationPolicy::class,
        \Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel::class => \App\Policies\InventoryPolicy::class,
        \Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel::class => \App\Policies\CashTransactionPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // System Administrator Matrix Rule (Section 24 of 15_AUTHORIZATION_MATRIX.md)
        Gate::before(function ($user, $ability) {
            if ($user instanceof UserModel && $user->status === 'ACTIVE') {
                if ($user->hasRole('SYSTEM_ADMIN')) {
                    // SYSTEM_ADMIN cannot auto-approve business decisions or score OCOP applications
                    $businessApprovalAbilities = [
                        'OCOP_DECISION.APPROVE',
                        'OCOP_EVALUATION.SCORE',
                        'OCOP_EVALUATION.LOCK',
                        'FINANCE.TRANSACTION.APPROVE',
                    ];

                    if (in_array($ability, $businessApprovalAbilities, true)) {
                        return null; // Fall through to standard permission check
                    }

                    // SYSTEM_ADMIN gets technical administration access automatically
                    return true;
                }

                // HTX_OWNER (Cooperative Executive / Legal Representative)
                if ($user->hasRole('HTX_OWNER')) {
                    $htxOwnerAbilities = [
                        'FINANCE.CREATE',
                        'FINANCE.READ',
                        'FINANCE.UPDATE',
                        'FINANCE.DELETE',
                        'FINANCE.TRANSACTION.CREATE',
                        'FINANCE.TRANSACTION.APPROVE',
                        'FINANCE.POST',
                        'DEBT.CREATE',
                        'DEBT.SETTLE',
                        'AGRICULTURE.CREATE',
                        'AGRICULTURE.READ',
                        'AGRICULTURE.UPDATE',
                        'AGRICULTURE.DELETE',
                        'AGRICULTURE.LOG.CREATE',
                        'AGRICULTURE.LOG.UPDATE',
                        'AGRICULTURE.LOG.DELETE',
                        'AGRICULTURE.LOG.READ',
                        'AGRICULTURE.PLOT.CREATE',
                        'AGRICULTURE.PLOT.READ',
                        'AGRICULTURE.PLOT.UPDATE',
                        'AGRICULTURE.SEASON.CREATE',
                        'AGRICULTURE.SEASON.READ',
                        'AGRICULTURE.SEASON.UPDATE',
                        'PRODUCT.CREATE',
                        'PRODUCT.READ',
                        'PRODUCT.UPDATE',
                        'PRODUCT.DELETE',
                        'OCOP.CREATE',
                        'OCOP.READ',
                        'OCOP.UPDATE',
                        'OCOP.DELETE',
                    ];
                    if (in_array($ability, $htxOwnerAbilities, true)) {
                        return true;
                    }
                }
            }
            return null;
        });

        // Dynamic Permission Check Strategy: Check if user has explicit permission via RBAC
        Gate::after(function ($user, $ability, $result) {
            if ($result === true) {
                return true;
            }

            if ($user instanceof UserModel && $user->status === 'ACTIVE') {
                if ($user->hasPermission($ability)) {
                    return true;
                }
                // Handle aliases (e.g. FINANCE.CREATE -> FINANCE.TRANSACTION.CREATE)
                if ($ability === 'FINANCE.CREATE' && $user->hasPermission('FINANCE.TRANSACTION.CREATE')) {
                    return true;
                }
            }

            return false;
        });
    }
}
