<?php

namespace Modules\Ocop\Criteria\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Ocop\Criteria\Application\DTOs\CreateCriteriaGroupDTO;
use Modules\Ocop\Criteria\Application\Services\CriteriaTreeService;
use Modules\Ocop\Criteria\Presentation\Http\Requests\CreateCriteriaGroupRequest;
use Modules\Ocop\Criteria\Presentation\Http\Resources\CriteriaGroupResource;

class CriteriaGroupController extends BaseController
{
    public function __construct(
        private readonly CriteriaTreeService $treeService
    ) {}

    public function indexByVersion(string $versionId): JsonResponse
    {
        $groups = $this->treeService->listGroupsByVersion($versionId);

        return $this->success(
            data: CriteriaGroupResource::collection($groups),
            message: 'Tải danh sách nhóm tiêu chí thành công'
        );
    }

    public function storeInVersion(string $versionId, CreateCriteriaGroupRequest $request): JsonResponse
    {
        $payload = array_merge($request->validated(), ['criteria_version_id' => $versionId]);
        $dto = CreateCriteriaGroupDTO::fromArray($payload);
        $group = $this->treeService->createGroup($dto);

        return $this->success(
            data: new CriteriaGroupResource($group),
            message: 'Tạo nhóm tiêu chí thành công',
            status: 201
        );
    }
}
