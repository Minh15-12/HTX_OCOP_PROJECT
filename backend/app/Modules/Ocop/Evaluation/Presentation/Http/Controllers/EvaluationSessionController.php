<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Ocop\Evaluation\Application\DTOs\AssignEvaluatorsDTO;
use Modules\Ocop\Evaluation\Application\DTOs\CreateEvaluationSessionDTO;
use Modules\Ocop\Evaluation\Application\Services\EvaluationSessionService;
use Modules\Ocop\Evaluation\Presentation\Http\Requests\AssignEvaluatorsRequest;
use Modules\Ocop\Evaluation\Presentation\Http\Requests\CreateEvaluationSessionRequest;
use Modules\Ocop\Evaluation\Presentation\Http\Resources\EvaluationSessionResource;

class EvaluationSessionController extends BaseController
{
    public function __construct(
        private readonly EvaluationSessionService $sessionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['application_id', 'council_level_id', 'status']);
        $perPage = (int) $request->get('per_page', 15);

        $paginator = $this->sessionService->listSessions($filters, $perPage);

        return $this->success(
            data: EvaluationSessionResource::collection($paginator->items()),
            message: 'Tải danh sách phiên đánh giá OCOP thành công',
            meta: [
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ]
        );
    }

    public function store(CreateEvaluationSessionRequest $request): JsonResponse
    {
        $dto = CreateEvaluationSessionDTO::fromArray($request->validated());
        $session = $this->sessionService->createSession($dto);

        return $this->success(
            data: new EvaluationSessionResource($session),
            message: 'Mở phiên họp đánh giá thành công',
            status: 201
        );
    }

    public function show(string $id): JsonResponse
    {
        $session = $this->sessionService->getSession($id);

        return $this->success(
            data: new EvaluationSessionResource($session),
            message: 'Tải thông tin chi tiết phiên họp đánh giá thành công'
        );
    }

    public function update(string $id, Request $request): JsonResponse
    {
        $session = $this->sessionService->updateSession($id, $request->only(['status']));

        return $this->success(
            data: new EvaluationSessionResource($session),
            message: 'Cập nhật phiên họp đánh giá thành công'
        );
    }

    public function assignEvaluators(string $id, AssignEvaluatorsRequest $request): JsonResponse
    {
        $dto = AssignEvaluatorsDTO::fromArray($request->validated());
        $session = $this->sessionService->assignEvaluators($id, $dto);

        return $this->success(
            data: new EvaluationSessionResource($session),
            message: 'Phân công giám khảo đánh giá thành công'
        );
    }
}
