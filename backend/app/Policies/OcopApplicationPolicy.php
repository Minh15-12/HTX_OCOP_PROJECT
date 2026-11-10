<?php

namespace App\Policies;

use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;

class OcopApplicationPolicy
{
    /**
     * Determine if the user can view any OCOP applications.
     */
    public function viewAny(UserModel $user): bool
    {
        return $user->hasPermission('OCOP_APPLICATION.READ') || $user->hasPermission('OCOP.APPLICATION.VIEW')
            || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF')
            || $user->hasRole('OCOP_PREPARER') || $user->hasRole('EVALUATOR') || $user->hasRole('COUNCIL_CHAIR');
    }

    /**
     * Determine if the user can view the OCOP application.
     */
    public function view(UserModel $user, OcopApplicationModel $application): bool
    {
        if ($user->hasRole('SYSTEM_ADMIN') || $user->hasRole('EVALUATOR') || $user->hasRole('COUNCIL_CHAIR') || $user->hasRole('AUTHORITY')) {
            return true;
        }

        return ($user->hasPermission('OCOP_APPLICATION.READ') || $user->hasPermission('OCOP.APPLICATION.VIEW') || $user->hasRole('HTX_OWNER') || $user->hasRole('HTX_STAFF') || $user->hasRole('OCOP_PREPARER'))
            && $user->cooperative_id === $application->cooperative_id;
    }

    /**
     * Determine if the user can create OCOP applications.
     * SoD: EVALUATOR cannot create cooperative applications.
     */
    public function create(UserModel $user): bool
    {
        if ($user->hasRole('EVALUATOR')) {
            return false;
        }

        return $user->hasPermission('OCOP_APPLICATION.CREATE') || $user->hasPermission('OCOP.APPLICATION.CREATE')
            || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('OCOP_PREPARER');
    }

    /**
     * Determine if the user can update the OCOP application.
     * SoD: EVALUATOR cannot modify cooperative dossier.
     */
    public function update(UserModel $user, OcopApplicationModel $application): bool
    {
        if ($user->hasRole('EVALUATOR')) {
            return false;
        }

        return ($user->hasPermission('OCOP_APPLICATION.UPDATE') || $user->hasPermission('OCOP.APPLICATION.UPDATE')
            || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('OCOP_PREPARER'))
            && $user->cooperative_id === $application->cooperative_id;
    }

    /**
     * Determine if the user can submit the OCOP application.
     */
    public function submit(UserModel $user, OcopApplicationModel $application): bool
    {
        return ($user->hasPermission('OCOP_APPLICATION.SUBMIT') || $user->hasPermission('OCOP.APPLICATION.SUBMIT')
            || $user->hasRole('SYSTEM_ADMIN') || $user->hasRole('HTX_OWNER') || $user->hasRole('OCOP_PREPARER'))
            && $user->cooperative_id === $application->cooperative_id;
    }

    /**
     * Determine if the user can evaluate the OCOP application.
     * SoD: Dossier preparer or staff without EVALUATOR role/permission cannot score applications.
     */
    public function evaluate(UserModel $user, OcopApplicationModel $application): bool
    {
        return $user->hasPermission('OCOP_EVALUATION.SCORE') || $user->hasRole('EVALUATOR') || $user->hasRole('COUNCIL_CHAIR');
    }
}
