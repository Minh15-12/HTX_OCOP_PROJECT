<?php

namespace Modules\Identity\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'] ?? $this->id,
            'username' => $this['username'] ?? $this->username,
            'email' => $this['email'] ?? $this->email,
            'full_name' => $this['full_name'] ?? $this->full_name,
            'cooperative_id' => $this['cooperative_id'] ?? $this->cooperative_id,
            'cooperative_name' => $this['cooperative_name'] ?? null,
            'status' => $this['status'] ?? $this->status,
            'roles' => $this['roles'] ?? [],
            'permissions' => $this['permissions'] ?? [],
        ];
    }
}
