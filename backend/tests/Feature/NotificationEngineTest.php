<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Modules\Audit\Domain\Events\AuditEventCreated;
use Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;
use Modules\Notification\Application\Listeners\AuditEventListener;
use Modules\Notification\Domain\Notifications\SecurityAlertNotification;
use Tests\TestCase;

class NotificationEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_phi_violation_triggers_security_alert_notification()
    {
        Notification::fake();

        $coopId = Str::uuid();
        DB::table('cooperatives')->insert([
            'id' => $coopId,
            'cooperative_code' => 'COOP_TEST',
            'legal_name' => 'HTX Test Legal',
            'display_name' => 'HTX Test',
            'status' => 'ACTIVE',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $roleId = Str::uuid();
        DB::table('roles')->insert([
            'id' => $roleId,
            'code' => 'DIRECTOR',
            'name' => 'Giám đốc',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $directorId = Str::uuid();
        DB::table('users')->insert([
            'id' => $directorId,
            'username' => 'director',
            'cooperative_id' => $coopId,
            'full_name' => 'Director',
            'email' => 'director@test.com',
            'password' => bcrypt('password'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_roles')->insert([
            'user_id' => $directorId,
            'role_id' => $roleId,
        ]);

        $director = UserModel::find($directorId);

        $auditEvent = AuditEventModel::create([
            'id' => Str::uuid(),
            'action' => 'PHI_VIOLATION_ATTEMPTED',
            'cooperative_id' => $coopId,
            'entity_type' => 'Harvest',
            'entity_id' => 'test',
        ]);

        $listener = new AuditEventListener;
        $listener->handle(new AuditEventCreated($auditEvent));

        Notification::assertSentTo(
            [$director], SecurityAlertNotification::class,
            function ($notification, $channels) use ($auditEvent) {
                return $notification->actionCode === 'PHI_VIOLATION_ATTEMPTED'
                    && $notification->auditId === $auditEvent->id;
            }
        );
    }

    public function test_user_can_list_notifications_and_mark_as_read()
    {
        $coopId = Str::uuid();
        DB::table('cooperatives')->insert([
            'id' => $coopId,
            'cooperative_code' => 'COOP_NOTIF',
            'legal_name' => 'HTX Notif Test',
            'display_name' => 'HTX Notif',
            'status' => 'ACTIVE',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $userId = Str::uuid();
        DB::table('users')->insert([
            'id' => $userId,
            'username' => 'notif_user',
            'cooperative_id' => $coopId,
            'full_name' => 'Notif User',
            'email' => 'notif_user@test.com',
            'password' => bcrypt('password'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $user = UserModel::find($userId);

        $notif1Id = Str::uuid()->toString();
        $notif2Id = Str::uuid()->toString();

        DB::table('notifications')->insert([
            [
                'id' => $notif1Id,
                'type' => 'Modules\Notification\Domain\Notifications\LowStockNotification',
                'notifiable_type' => get_class($user),
                'notifiable_id' => $user->id,
                'data' => json_encode(['title' => 'Cảnh báo tồn kho', 'message' => 'Vật tư VT01 sắp hết']),
                'read_at' => null,
                'created_at' => now()->subMinutes(10),
                'updated_at' => now()->subMinutes(10),
            ],
            [
                'id' => $notif2Id,
                'type' => 'Modules\Notification\Domain\Notifications\ExpiringOcopNotification',
                'notifiable_type' => get_class($user),
                'notifiable_id' => $user->id,
                'data' => json_encode(['title' => 'Cảnh báo OCOP', 'message' => 'Chứng nhận sắp hết hạn']),
                'read_at' => null,
                'created_at' => now()->subMinutes(5),
                'updated_at' => now()->subMinutes(5),
            ],
        ]);

        // 1. List notifications
        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/notifications');
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertEquals(2, $response->json('meta.unread_count'));
        $this->assertCount(2, $response->json('data'));

        // 2. Mark single as read
        $markResponse = $this->actingAs($user, 'sanctum')->postJson("/api/v1/notifications/{$notif1Id}/mark-as-read");
        $markResponse->assertStatus(200);
        $this->assertNotNull($user->notifications()->find($notif1Id)->read_at);

        // 3. Mark all as read
        $markAllResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/notifications/mark-all-read');
        $markAllResponse->assertStatus(200);
        $this->assertEquals(0, $user->unreadNotifications()->count());
    }
}
