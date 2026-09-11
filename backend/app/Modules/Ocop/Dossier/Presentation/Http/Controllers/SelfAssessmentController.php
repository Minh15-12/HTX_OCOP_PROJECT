<?php

namespace Modules\Ocop\Dossier\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Ocop\Dossier\Application\DTOs\SaveSelfAssessmentDTO;
use Modules\Ocop\Dossier\Application\Services\SelfAssessmentService;
use Modules\Ocop\Dossier\Presentation\Http\Requests\SaveSelfAssessmentRequest;
use Modules\Ocop\Dossier\Presentation\Http\Resources\SelfAssessmentResource;

class SelfAssessmentController extends BaseController
{
    public function __construct(
        private readonly SelfAssessmentService $selfAssessmentService
    ) {}

    public function index(string $id): JsonResponse
    {
        $assessments = $this->selfAssessmentService->listSelfAssessments($id);

        return $this->success(
            data: SelfAssessmentResource::collection($assessments),
            message: 'Tải danh sách điểm tự đánh giá thành công'
        );
    }

    public function store(string $id, SaveSelfAssessmentRequest $request): JsonResponse
    {
        $dto = SaveSelfAssessmentDTO::fromArray($request->validated());
        $assessment = $this->selfAssessmentService->saveSelfAssessment($id, $dto);

        return $this->success(
            data: new SelfAssessmentResource($assessment),
            message: 'Lưu điểm tự đánh giá chỉ tiêu thành công',
            status: 201
        );
    }
}
