<?php

namespace Modules\Audit\Application\Services;

use Illuminate\Support\Facades\Log;

class AuditService
{
    public function log(
        string $action,
        string $entityType,
        ?string $entityId = null,
        ?array $before = null,
        ?array $after = null,
        ?string $actorId = null,
        ?string $cooperativeId = null
    ): void {
        try {
            $user = auth()->user();
            $currentActorId = $actorId ?: ($user ? $user->id : null);
            $currentCoopId = $cooperativeId ?: ($user ? $user->cooperative_id : null);
            $requestId = request()->header('X-Request-ID');
            $ipAddress = request()->ip();

            // Append-only audit record creation (catches exceptions gracefully to avoid breaking main transaction)
            if (\Illuminate\Support\Facades\Schema::hasTable('audit_events')) {
                $lastEvent = \Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel::orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
                $prevHash = $lastEvent?->current_hash ?: str_repeat('0', 64);

                $payload = json_encode([
                    'action' => $action,
                    'entity_type' => $entityType,
                    'entity_id' => $entityId,
                    'before' => $before,
                    'after' => $after,
                    'actor_id' => $currentActorId,
                    'cooperative_id' => $currentCoopId,
                    'request_id' => $requestId,
                ]);

                $currentHash = hash('sha256', $payload . $prevHash);

                $event = \Modules\Audit\Infrastructure\Persistence\Models\AuditEventModel::create([
                    'actor_id' => $currentActorId,
                    'action' => $action,
                    'entity_type' => $entityType,
                    'entity_id' => $entityId,
                    'before_reference' => $before,
                    'after_reference' => $after,
                    'cooperative_id' => $currentCoopId,
                    'ip_address' => $ipAddress,
                    'request_id' => $requestId,
                    'prev_hash' => $prevHash,
                    'current_hash' => $currentHash,
                    'created_at' => now(),
                ]);

                event(new \Modules\Audit\Domain\Events\AuditEventCreated($event));
            }

            Log::info("AUDIT EVENT: [{$action}] on [{$entityType}:{$entityId}] by User [{$currentActorId}]", [
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'actor_id' => $currentActorId,
                'cooperative_id' => $currentCoopId,
                'request_id' => $requestId,
            ]);
        } catch (\Throwable $e) {
            Log::error("AUDIT LOG ERROR: " . $e->getMessage(), ['exception' => $e]);
        }
    }
}
