<?php

namespace Modules\Ocop\Evaluation\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Modules\Ocop\Evaluation\Application\DTOs\ApproveFinalDecisionDTO;
use Modules\Ocop\Evaluation\Application\DTOs\RejectApplicationDTO;
use Modules\Ocop\Evaluation\Application\Services\FinalDecisionService;
use Modules\Ocop\Evaluation\Presentation\Http\Requests\ApproveFinalDecisionRequest;
use Modules\Ocop\Evaluation\Presentation\Http\Requests\RejectApplicationRequest;
use Modules\Ocop\Evaluation\Presentation\Http\Resources\FinalDecisionResource;

class FinalDecisionController extends BaseController
{
    public function __construct(
        private readonly FinalDecisionService $decisionService
    ) {}

    public function show(string $applicationId): JsonResponse
    {
        $decision = $this->decisionService->getDecision($applicationId);

        return $this->success(
            data: new FinalDecisionResource($decision),
            message: 'Tải thông tin quyết định công nhận OCOP thành công'
        );
    }

    public function approve(string $applicationId, ApproveFinalDecisionRequest $request): JsonResponse
    {
        $dto = ApproveFinalDecisionDTO::fromArray($request->validated());
        $decision = $this->decisionService->approve($applicationId, $dto);

        return $this->success(
            data: new FinalDecisionResource($decision),
            message: 'Phê duyệt kết quả công nhận OCOP chính thức thành công',
            status: 201
        );
    }

    public function reject(string $applicationId, RejectApplicationRequest $request): JsonResponse
    {
        $dto = RejectApplicationDTO::fromArray($request->validated());
        $decision = $this->decisionService->reject($applicationId, $dto);

        return $this->success(
            data: new FinalDecisionResource($decision),
            message: 'Từ chối công nhận hồ sơ OCOP thành công',
            status: 201
        );
    }
}
