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

    public function index(Request $request): JsonResponse
    {
        $query = EvidenceModel::with(['currentVersion', 'indicators', 'application']);

        if ($request->filled('application_id')) {
            $query->where('application_id', $request->query('application_id'));
        }

        if ($request->filled('evidence_type')) {
            $query->where('evidence_type', $request->query('evidence_type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $evidences = $query->orderBy('created_at', 'desc')->get();

        return $this->success(
            data: EvidenceResource::collection($evidences),
            message: 'Tải danh sách kho minh chứng số thành công'
        );
    }

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

    public function store(UploadEvidenceRequest $request): JsonResponse
    {
        $applicationId = $request->input('application_id');
        if (!$applicationId) {
            $latestApp = \Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel::orderBy('created_at', 'desc')->first();
            $applicationId = $latestApp ? $latestApp->id : null;
        }

        if (!$applicationId) {
            return $this->error('Không tìm thấy hồ sơ OCOP nào để đính kèm minh chứng. Vui lòng tạo hồ sơ OCOP trước.', 400);
        }

        return $this->storeInApplication($applicationId, $request);
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
        $productionUnitId = $request->input('production_unit_id');
        $requestedBy = auth()->id() ?: 'SYSTEM';
        $result = $this->autoExtractionService->extractInternalEvidence($applicationId, $type, $requestedBy, $productionUnitId);

        if (is_array($result)) {
            $data = [];
            foreach ($result as $key => $item) {
                $data[$key] = new EvidenceDetailResource($item);
            }
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
