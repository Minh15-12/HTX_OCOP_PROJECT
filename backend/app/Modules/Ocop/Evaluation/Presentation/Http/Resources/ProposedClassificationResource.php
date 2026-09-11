<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProposedClassificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'result_id' => $this->result_id,
            'proposed_level' => $this->proposed_level,
            'rule_version_reference' => $this->rule_version_reference,
            'reason' => $this->reason,
            'status' => $this->status,
        ];
    }
}
