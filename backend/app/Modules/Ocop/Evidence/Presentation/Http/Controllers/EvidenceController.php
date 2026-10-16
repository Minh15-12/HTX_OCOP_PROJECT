<?php

namespace Modules\Ocop\Evidence\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Ocop\Evidence\Application\DTOs\UploadEvidenceDTO;
use Modules\Ocop\Evidence\Application\DTOs\VerifyEvidenceDTO;
use Modules\Ocop\Evidence\Application\Services\EvidenceDownloadService;
use Modules\Ocop\Evidence\Application\Services\EvidenceUploadService;
use Modules\Ocop\Evidence\Application\Services\EvidenceVerificationService;
use Modules\Ocop\Evidence\Application\Services\EvidenceVersionService;
use Modules\Ocop\Evidence\Application\Services\OcopEvidenceAutoExtractionService;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;
use Modules\Ocop\Evidence\Presentation\Http\Requests\UploadEvidenceRequest;
use Modules\Ocop\Evidence\Presentation\Http\Requests\VerifyEvidenceRequest;
use Modules\Ocop\Evidence\Presentation\Http\Resources\EvidenceDetailResource;
use Modules\Ocop\Evidence\Presentation\Http\Resources\EvidenceResource;

class EvidenceController extends BaseController
{
    public function __construct(
        private readonly EvidenceUploadService $uploadService,
        private readonly EvidenceVersionService $versionService,
        private readonly EvidenceVerificationService $verificationService,
        private readonly EvidenceDownloadService $downloadService,
        private readonly OcopEvidenceAutoExtractionService $autoExtractionService
    ) {}

    public function indexByApplication(string $applicationId): JsonResponse
    {
        $evidences = EvidenceModel::with(['currentVersion', 'indicators'])
            ->where('application_id', $applicationId)
            ->get();

        return $this->success(
            data: EvidenceResource::collection($evidences),
            message: 'Tải danh sách minh chứng của hồ sơ thành công'
        );
    }

    public function storeInApplication(string $applicationId, UploadEvidenceRequest $request): JsonResponse
    {
        $payload = array_merge($request->validated(), ['application_id' => $applicationId]);
        $dto = UploadEvidenceDTO::fromArray($payload);
        $evidence = $this->uploadService->uploadEvidence($dto);

        return $this->success(
            data: new EvidenceDetailResource($evidence),
            message: 'Tải lên minh chứng thành công',
            status: 201
        );
    }

    public function extractInternal(string $applicationId, Request $request): JsonResponse
    {
        $type = $request->input('extraction_type', 'ALL');
        $requestedBy = auth()->id() ?: 'SYSTEM';
        $result = $this->autoExtractionService->extractInternalEvidence($applicationId, $type, $requestedBy);

        if (is_array($result)) {
            $data = [
                'farm_plot' => new EvidenceDetailResource($result['farm_plot']),
                'member_list' => new EvidenceDetailResource($result['member_list']),
                'phi_journal' => new EvidenceDetailResource($result['phi_journal']),
            ];
            $msg = 'Trích xuất tự động toàn bộ minh chứng nội bộ HTX thành công';
        } else {
            $data = new EvidenceDetailResource($result);
            $msg = 'Trích xuất tự động minh chứng nội bộ HTX thành công';
        }

        return $this->success(
            data: $data,
            message: $msg,
            status: 201
        );
    }

    public function show(string $id): JsonResponse
    {
        $evidence = $this->versionService->getEvidenceById($id);

        return $this->success(
            data: new EvidenceDetailResource($evidence),
            message: 'Tải thông tin minh chứng thành công'
        );
    }

    public function downloadUrl(string $id): JsonResponse
    {
        $downloadData = $this->downloadService->generateSignedUrl($id);

        return $this->success(
            data: $downloadData,
            message: 'Tạo đường dẫn tải file minh chứng an toàn thành công'
        );
    }

    public function fileStream(string $id)
    {
        return $this->downloadService->getPhysicalFileStream($id);
    }

    public function verify(string $id, VerifyEvidenceRequest $request): JsonResponse
    {
        $payload = array_merge($request->validated(), ['evidence_id' => $id]);
        $dto = VerifyEvidenceDTO::fromArray($payload);
        $evidence = $this->verificationService->verifyOrReject($dto);

        $msg = $dto->status === 'VERIFIED'
            ? 'Xác minh minh chứng thành công'
            : 'Đã từ chối minh chứng';

        return $this->success(
            data: new EvidenceResource($evidence),
            message: $msg
        );
    }
}
