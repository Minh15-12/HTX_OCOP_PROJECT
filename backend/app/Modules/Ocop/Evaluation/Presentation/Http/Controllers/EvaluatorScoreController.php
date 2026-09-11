<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Ocop\Evaluation\Application\DTOs\SaveEvaluatorScoreDTO;
use Modules\Ocop\Evaluation\Application\Services\EvaluatorScoreService;
use Modules\Ocop\Evaluation\Presentation\Http\Requests\SaveEvaluatorScoreRequest;
use Modules\Ocop\Evaluation\Presentation\Http\Resources\EvaluatorAssignmentResource;
use Modules\Ocop\Evaluation\Presentation\Http\Resources\EvaluatorScoreResource;

class EvaluatorScoreController extends BaseController
{
    public function __construct(
        private readonly EvaluatorScoreService $scoreService
    ) {}

    public function index(string $sessionId, Request $request): JsonResponse
    {
        $userId = auth()->id() ?: '';
        $isChairmanOrAdmin = auth()->user()?->hasRole(['CHAIRMAN', 'ADMIN', 'SYSTEM_ADMIN']) ?? false;

        $assignments = $this->scoreService->getScoresBySession($sessionId, $userId, $isChairmanOrAdmin);

        return $this->success(
            data: EvaluatorAssignmentResource::collection($assignments),
            message: 'Tải danh sách phiếu chấm điểm thành công'
        );
    }

    public function store(string $sessionId, SaveEvaluatorScoreRequest $request): JsonResponse
    {
        $evaluatorId = auth()->id() ?: (string) $request->input('evaluator_id', '');
        $dto = SaveEvaluatorScoreDTO::fromArray($request->validated());

        $scores = $this->scoreService->saveScores($sessionId, $evaluatorId, $dto);

        return $this->success(
            data: EvaluatorScoreResource::collection($scores),
            message: 'Lưu điểm đánh giá thành công',
            status: 200
        );
    }

    public function lock(string $id, Request $request): JsonResponse
    {
        $evaluatorId = auth()->id() ?: (string) $request->input('evaluator_id', '');

        $assignment = $this->scoreService->lockScores($id, $evaluatorId);

        return $this->success(
            data: new EvaluatorAssignmentResource($assignment),
            message: 'Khóa phiếu chấm điểm thành công'
        );
    }
}
