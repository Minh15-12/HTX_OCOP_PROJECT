<?php

namespace Modules\Ocop\Evidence\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Ocop\Evidence\Application\DTOs\ReplaceEvidenceVersionDTO;
use Modules\Ocop\Evidence\Application\Services\EvidenceVersionService;
use Modules\Ocop\Evidence\Presentation\Http\Requests\ReplaceEvidenceVersionRequest;
use Modules\Ocop\Evidence\Presentation\Http\Resources\EvidenceDetailResource;

class EvidenceVersionController extends BaseController
{
    public function __construct(
        private readonly EvidenceVersionService $versionService
    ) {}

    public function replaceVersion(string $id, ReplaceEvidenceVersionRequest $request): JsonResponse
    {
        $payload = array_merge($request->validated(), ['evidence_id' => $id]);
        $dto = ReplaceEvidenceVersionDTO::fromArray($payload);
        $evidence = $this->versionService->replaceVersion($dto);

        return $this->success(
            data: new EvidenceDetailResource($evidence),
            message: 'Thay thế phiên bản minh chứng thành công',
            status: 201
        );
    }
}
