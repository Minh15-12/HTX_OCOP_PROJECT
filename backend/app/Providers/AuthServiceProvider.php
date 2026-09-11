<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [];

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
            }
            return null;
        });

        // Dynamic Permission Check Strategy: Check if user has explicit permission via RBAC
        Gate::after(function ($user, $ability, $result) {
            if ($result === true) {
                return true;
            }

            if ($user instanceof UserModel && $user->status === 'ACTIVE') {
                return $user->hasPermission($ability);
            }

            return false;
        });
    }
}
