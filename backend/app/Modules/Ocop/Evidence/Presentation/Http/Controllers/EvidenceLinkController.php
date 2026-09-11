<?php

namespace Modules\Ocop\Evidence\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Ocop\Evidence\Application\DTOs\LinkEvidenceDTO;
use Modules\Ocop\Evidence\Application\Services\EvidenceLinkService;
use Modules\Ocop\Evidence\Presentation\Http\Requests\LinkEvidenceRequest;

class EvidenceLinkController extends BaseController
{
    public function __construct(
        private readonly EvidenceLinkService $linkService
    ) {}

    public function linkToIndicator(string $id, LinkEvidenceRequest $request): JsonResponse
    {
        $payload = array_merge($request->validated(), ['evidence_id' => $id]);
        $dto = LinkEvidenceDTO::fromArray($payload);
        $link = $this->linkService->linkToIndicator($dto);

        return $this->success(
            data: $link,
            message: 'Gán minh chứng vào chỉ tiêu thành công',
            status: 201
        );
    }

    public function unlinkFromIndicator(string $id, string $indicatorId): JsonResponse
    {
        $this->linkService->unlinkFromIndicator($id, $indicatorId);

        return $this->success(
            data: null,
            message: 'Gỡ gán minh chứng khỏi chỉ tiêu thành công'
        );
    }
}
