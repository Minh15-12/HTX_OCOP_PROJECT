<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Ocop\Criteria\Application\DTOs\CreateCriterionDTO;
use Modules\Ocop\Criteria\Application\Services\CriteriaTreeService;
use Modules\Ocop\Criteria\Presentation\Http\Requests\CreateCriterionRequest;
use Modules\Ocop\Criteria\Presentation\Http\Resources\CriterionResource;

class CriterionController extends BaseController
{
    public function __construct(
        private readonly CriteriaTreeService $treeService
    ) {}

    public function indexByGroup(string $groupId): JsonResponse
    {
        $criteria = $this->treeService->listCriteriaByGroup($groupId);

        return $this->success(
            data: CriterionResource::collection($criteria),
            message: 'Tải danh sách tiêu chí thành công'
        );
    }

    public function storeInGroup(string $groupId, CreateCriterionRequest $request): JsonResponse
    {
        $payload = array_merge($request->validated(), ['criteria_group_id' => $groupId]);
        $dto = CreateCriterionDTO::fromArray($payload);
        $criterion = $this->treeService->createCriterion($dto);

        return $this->success(
            data: new CriterionResource($criterion),
            message: 'Tạo tiêu chí thành công',
            status: 201
        );
    }
}
