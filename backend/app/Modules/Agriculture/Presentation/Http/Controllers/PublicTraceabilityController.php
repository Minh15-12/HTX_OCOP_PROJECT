<?php

namespace Modules\Agriculture\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Agriculture\Application\Services\LotService;

class PublicTraceabilityController extends BaseController
{
    public function __construct(private readonly LotService $lotService) {}

    /**
     * Public Traceability Dossier lookup by lot_code or UUID id.
     * No authentication required.
     */
    public function show(string $lotId): JsonResponse
    {
        $dossier = $this->lotService->getPublicTraceability($lotId);

        return ApiResponse::success(
            data: $dossier,
            message: 'Truy xuất nguồn gốc sản phẩm thành công'
        );
    }
}
