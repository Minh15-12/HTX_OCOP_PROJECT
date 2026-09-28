<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Modules\Audit\Domain\Events\AuditEventCreated;
use Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Notification\Application\Listeners\AuditEventListener;
use Modules\Notification\Domain\Notifications\SecurityAlertNotification;
use Tests\TestCase;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;

class NotificationEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_phi_violation_triggers_security_alert_notification()
    {
        Notification::fake();

        $coopId = \Illuminate\Support\Str::uuid();
        \Illuminate\Support\Facades\DB::table('cooperatives')->insert([
            'id' => $coopId,
            'cooperative_code' => 'COOP_TEST',
            'legal_name' => 'HTX Test Legal',
            'display_name' => 'HTX Test',
            'status' => 'ACTIVE',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        $roleId = \Illuminate\Support\Str::uuid();
        \Illuminate\Support\Facades\DB::table('roles')->insert([
            'id' => $roleId,
            'code' => 'DIRECTOR',
            'name' => 'Giám đốc',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        $directorId = \Illuminate\Support\Str::uuid();
        \Illuminate\Support\Facades\DB::table('users')->insert([
            'id' => $directorId,
            'username' => 'director',
            'cooperative_id' => $coopId,
            'full_name' => 'Director',
            'email' => 'director@test.com',
            'password' => bcrypt('password'),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        \Illuminate\Support\Facades\DB::table('user_roles')->insert([
            'user_id' => $directorId,
            'role_id' => $roleId,
        ]);
        
        $director = UserModel::find($directorId);

        $auditEvent = AuditEventModel::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'action' => 'PHI_VIOLATION_ATTEMPTED',
            'cooperative_id' => $coopId,
            'entity_type' => 'Harvest',
            'entity_id' => 'test',
        ]);

        $listener = new AuditEventListener();
        $listener->handle(new AuditEventCreated($auditEvent));

        Notification::assertSentTo(
            [$director], SecurityAlertNotification::class,
            function ($notification, $channels) use ($auditEvent) {
                return $notification->actionCode === 'PHI_VIOLATION_ATTEMPTED' 
                    && $notification->auditId === $auditEvent->id;
            }
        );
    }
}
