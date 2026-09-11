<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Ocop\Criteria\Application\DTOs\CreateIndicatorDTO;
use Modules\Ocop\Criteria\Application\DTOs\UpdateIndicatorDTO;
use Modules\Ocop\Criteria\Application\Services\CriteriaTreeService;
use Modules\Ocop\Criteria\Presentation\Http\Requests\CreateIndicatorRequest;
use Modules\Ocop\Criteria\Presentation\Http\Requests\UpdateIndicatorRequest;
use Modules\Ocop\Criteria\Presentation\Http\Resources\IndicatorResource;

class IndicatorController extends BaseController
{
    public function __construct(
        private readonly CriteriaTreeService $treeService
    ) {}

    public function indexByCriterion(string $criterionId): JsonResponse
    {
        $indicators = $this->treeService->listIndicatorsByCriterion($criterionId);

        return $this->success(
            data: IndicatorResource::collection($indicators),
            message: 'Tải danh sách chỉ tiêu chi tiết thành công'
        );
    }

    public function storeInCriterion(string $criterionId, CreateIndicatorRequest $request): JsonResponse
    {
        $payload = array_merge($request->validated(), ['criterion_id' => $criterionId]);
        $dto = CreateIndicatorDTO::fromArray($payload);
        $indicator = $this->treeService->createIndicator($dto);

        return $this->success(
            data: new IndicatorResource($indicator),
            message: 'Tạo chỉ tiêu thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateIndicatorRequest $request): JsonResponse
    {
        $dto = UpdateIndicatorDTO::fromArray($request->validated());
        $indicator = $this->treeService->updateIndicator($id, $dto);

        return $this->success(
            data: new IndicatorResource($indicator),
            message: 'Cập nhật chỉ tiêu thành công'
        );
    }
}
