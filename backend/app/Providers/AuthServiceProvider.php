<?php

namespace App\Providers;

use App\Policies\CashTransactionPolicy;
use App\Policies\InventoryPolicy;
use App\Policies\MemberPolicy;
use App\Policies\OcopApplicationPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        MemberModel::class => MemberPolicy::class,
        OcopApplicationModel::class => OcopApplicationPolicy::class,
        MaterialModel::class => InventoryPolicy::class,
        CashTransactionModel::class => CashTransactionPolicy::class,
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
                        'OCOP_APPLICATION.READ',
                        'OCOP_APPLICATION.CREATE',
                        'OCOP_APPLICATION.UPDATE',
                        'OCOP_APPLICATION.SUBMIT',
                        'ROLE.READ',
                    ];
                    if (in_array($ability, $htxOwnerAbilities, true)) {
                        return true;
                    }
                }

                // CHAIRMAN / COUNCIL_CHAIR / ADMIN (OCOP Council Authority)
                if ($user->hasRole('CHAIRMAN') || $user->hasRole('COUNCIL_CHAIR') || $user->hasRole('ADMIN')) {
                    $chairAbilities = [
                        'OCOP_DECISION.APPROVE',
                        'OCOP_DECISION.RECORD',
                        'OCOP_DECISION.READ',
                        'OCOP_EVALUATION.SCORE',
                        'OCOP_EVALUATION.LOCK',
                        'OCOP_EVALUATION.CONSOLIDATE',
                        'OCOP_EVALUATION.READ',
                        'OCOP_APPLICATION.READ',
                        'OCOP.APPLICATION.VIEW',
                    ];
                    if (in_array($ability, $chairAbilities, true)) {
                        return true;
                    }
                }

                // EVALUATOR / COUNCIL_MEMBER (Independent OCOP Reviewer)
                if ($user->hasRole('EVALUATOR') || $user->hasRole('COUNCIL_MEMBER')) {
                    $evaluatorAbilities = [
                        'OCOP_EVALUATION.SCORE',
                        'OCOP_EVALUATION.LOCK',
                        'OCOP_EVALUATION.READ',
                        'OCOP_APPLICATION.READ',
                        'OCOP.APPLICATION.VIEW',
                    ];
                    if (in_array($ability, $evaluatorAbilities, true)) {
                        return true;
                    }
                }

                // ACCOUNTANT (HTX Finance Manager - SoD: No self-approval, no OCOP scoring)
                if ($user->hasRole('ACCOUNTANT')) {
                    $accountantAbilities = [
                        'FINANCE.READ',
                        'FINANCE.VIEW',
                        'FINANCE.CREATE',
                        'FINANCE.TRANSACTION.CREATE',
                        'FINANCE.TRANSACTION.UPDATE',
                        'FINANCE.POST',
                        'CAPITAL.READ',
                        'CAPITAL.CREATE',
                    ];
                    if (in_array($ability, $accountantAbilities, true)) {
                        return true;
                    }
                }

                // STOREKEEPER (HTX Inventory Manager - SoD: No financial disbursements)
                if ($user->hasRole('STOREKEEPER')) {
                    $storekeeperAbilities = [
                        'INVENTORY.READ',
                        'INVENTORY.VIEW',
                        'INVENTORY.CREATE',
                        'INVENTORY.UPDATE',
                        'STOCK.READ',
                        'STOCK.CREATE',
                        'STOCK.UPDATE',
                        'STOCK.APPROVE',
                    ];
                    if (in_array($ability, $storekeeperAbilities, true)) {
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
