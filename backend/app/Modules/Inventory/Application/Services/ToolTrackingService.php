<?php

namespace Modules\Inventory\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MemberToolTrackingModel;

class ToolTrackingService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function listToolTrackings(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = MemberToolTrackingModel::with(['member', 'plot', 'material', 'creator']);

        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if (!empty($filters['member_id'])) {
            $query->where('member_id', $filters['member_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('serial_number', $likeOp, $search)
                  ->orWhereHas('material', function ($mq) use ($search, $likeOp) {
                      $mq->where('name', $likeOp, $search)->orWhere('sku', $likeOp, $search);
                  })
                  ->orWhereHas('member', function ($mq) use ($search, $likeOp) {
                      $mq->where('member_code', $likeOp, $search)
                         ->orWhereRaw("identity_information->>'full_name' {$likeOp} ?", [$search]);
                  });
            });
        }

        return $query->orderBy('assigned_date', 'desc')->paginate(min(max($perPage, 1), 100));
    }

    public function assignTool(array $data): MemberToolTrackingModel
    {
        $coopId = $this->tenantContext->getCooperativeId();

        $material = MaterialModel::where('cooperative_id', $coopId)->findOrFail($data['material_id']);
        if (!$material->is_durable_tool) {
            $material->update(['is_durable_tool' => true]);
        }

        $tracking = MemberToolTrackingModel::create([
            'id' => (string) Str::uuid(),
            'cooperative_id' => $coopId,
            'member_id' => $data['member_id'],
            'farm_plot_id' => $data['farm_plot_id'] ?? null,
            'material_id' => $data['material_id'],
            'serial_number' => $data['serial_number'] ?? ('TOOL-' . strtoupper(Str::random(6))),
            'quantity' => (int) ($data['quantity'] ?? 1),
            'status' => 'IN_USE',
            'assigned_date' => $data['assigned_date'] ?? now()->toDateString(),
            'note' => $data['note'] ?? 'Cấp phát công cụ định danh phục vụ chăm sóc nhà màng',
            'created_by' => auth()->check() ? auth()->id() : null,
        ]);

        $this->auditService->log(
            action: 'TOOL_ASSIGNED_TK005',
            entityType: 'MemberToolTracking',
            entityId: $tracking->id,
            after: $tracking->toArray(),
            cooperativeId: $coopId
        );

        return $tracking->load(['member', 'plot', 'material', 'creator']);
    }

    public function returnOrReplaceTool(string $id, string $action, ?string $note = null): MemberToolTrackingModel
    {
        $coopId = $this->tenantContext->getCooperativeId();
        $tracking = MemberToolTrackingModel::where('cooperative_id', $coopId)->findOrFail($id);

        if ($action === 'REPLACE_1_1') {
            // Mark old tool as DAMAGED_RETURNED
            $tracking->update([
                'status' => 'DAMAGED_RETURNED',
                'returned_date' => now()->toDateString(),
                'note' => ($tracking->note ? $tracking->note . ' | ' : '') . "Đổi trả 1:1 xác hỏng: {$note}",
            ]);

            // Issue replacement tool
            $newTracking = MemberToolTrackingModel::create([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'member_id' => $tracking->member_id,
                'farm_plot_id' => $tracking->farm_plot_id,
                'material_id' => $tracking->material_id,
                'serial_number' => 'TOOL-REPLACE-' . strtoupper(Str::random(4)),
                'quantity' => $tracking->quantity,
                'status' => 'IN_USE',
                'assigned_date' => now()->toDateString(),
                'note' => "Đổi mới 1:1 thay thế cho công cụ hỏng [{$tracking->serial_number}]",
                'created_by' => auth()->check() ? auth()->id() : null,
            ]);

            $this->auditService->log(
                action: 'TOOL_REPLACED_1_1_TK005',
                entityType: 'MemberToolTracking',
                entityId: $newTracking->id,
                after: $newTracking->toArray(),
                cooperativeId: $coopId
            );

            return $newTracking->load(['member', 'plot', 'material', 'creator']);
        }

        $tracking->update([
            'status' => $action, // MAINTENANCE, DAMAGED_RETURNED, LOST
            'returned_date' => in_array($action, ['DAMAGED_RETURNED', 'LOST'], true) ? now()->toDateString() : null,
            'note' => $note ?: $tracking->note,
        ]);

        $this->auditService->log(
            action: 'TOOL_STATUS_UPDATED_TK005',
            entityType: 'MemberToolTracking',
            entityId: $tracking->id,
            after: $tracking->toArray(),
            cooperativeId: $coopId
        );

        return $tracking->fresh(['member', 'plot', 'material', 'creator']);
    }
}
