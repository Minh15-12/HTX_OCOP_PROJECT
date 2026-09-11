<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Ocop\Criteria\Application\Services\CouncilLevelService;
use Modules\Ocop\Criteria\Presentation\Http\Resources\CouncilLevelResource;

class CouncilLevelController extends BaseController
{
    public function __construct(
        private readonly CouncilLevelService $levelService
    ) {}

    public function index(): JsonResponse
    {
        $levels = $this->levelService->listCouncilLevels();
        return $this->success(
            data: CouncilLevelResource::collection($levels),
            message: 'Tải danh mục cấp hội đồng thành công'
        );
    }
}
