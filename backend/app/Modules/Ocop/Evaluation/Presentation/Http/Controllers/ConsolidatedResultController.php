<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Ocop\Evaluation\Application\Services\EvaluationConsolidationService;
use Modules\Ocop\Evaluation\Presentation\Http\Resources\ConsolidatedResultResource;

class ConsolidatedResultController extends BaseController
{
    public function __construct(
        private readonly EvaluationConsolidationService $consolidationService
    ) {}

    public function consolidate(string $id): JsonResponse
    {
        $result = $this->consolidationService->consolidate($id);

        return $this->success(
            data: new ConsolidatedResultResource($result),
            message: 'Tổng hợp điểm và đề xuất phân hạng sao OCOP thành công',
            status: 200
        );
    }

    public function show(string $id): JsonResponse
    {
        $result = $this->consolidationService->getConsolidatedResult($id);

        return $this->success(
            data: new ConsolidatedResultResource($result),
            message: 'Tải kết quả tổng hợp điểm đánh giá thành công'
        );
    }
}
