<?php

namespace Modules\Identity\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        if (is_array($this->resource)) {
            return [
                'id' => $this->resource['id'] ?? null,
                'username' => $this->resource['username'] ?? '',
                'email' => $this->resource['email'] ?? '',
                'full_name' => $this->resource['full_name'] ?? '',
                'cooperative_id' => $this->resource['cooperative_id'] ?? null,
                'cooperative_name' => $this->resource['cooperative_name'] ?? null,
                'member_id' => $this->resource['member_id'] ?? null,
                'member_code' => $this->resource['member_code'] ?? null,
                'status' => $this->resource['status'] ?? 'ACTIVE',
                'roles' => $this->resource['roles'] ?? [],
                'permissions' => $this->resource['permissions'] ?? [],
            ];
        }

        $roles = $this->relationLoaded('roles')
            ? $this->roles->map(fn($r) => [
                'id' => $r->id,
                'code' => $r->code,
                'name' => $r->name,
            ])->toArray()
            : [];

        $permissions = $this->relationLoaded('roles')
            ? $this->roles->flatMap->permissions->pluck('code')->unique()->values()->toArray()
            : [];

        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'full_name' => $this->full_name,
            'phone_number' => $this->phone_number ?? null,
            'cooperative_id' => $this->cooperative_id,
            'cooperative_name' => $this->relationLoaded('cooperative') ? $this->cooperative?->legal_name : null,
            'member_id' => $this->member?->id ?? ($this->resource['member_id'] ?? null),
            'member_code' => $this->member?->member_code ?? ($this->resource['member_code'] ?? null),
            'status' => $this->status,
            'roles' => $roles,
            'permissions' => $permissions,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
