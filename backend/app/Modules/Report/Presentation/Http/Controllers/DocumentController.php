<?php

namespace Modules\Report\Presentation\Http\Controllers;

use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Report\Application\Services\OcopDocumentService;
use Modules\Report\Presentation\Http\Resources\GeneratedDocumentResource;

class DocumentController extends BaseController
{
    public function __construct(
        private readonly OcopDocumentService $documentService
    ) {}

    public function generateDossier(string $applicationId, Request $request): JsonResponse
    {
        $requestedBy = auth()->id() ?: 'SYSTEM';
        $document = $this->documentService->generateOcopDossierPdf($applicationId, $requestedBy);

        return $this->success(
            data: new GeneratedDocumentResource($document),
            message: 'Yêu cầu kết xuất bộ hồ sơ OCOP PDF thành công',
            status: 201
        );
    }

    public function generateCertificate(string $applicationId, Request $request): JsonResponse
    {
        $requestedBy = auth()->id() ?: 'SYSTEM';
        $document = $this->documentService->generateCertificatePdf($applicationId, $requestedBy);

        return $this->success(
            data: new GeneratedDocumentResource($document),
            message: 'Yêu cầu kết xuất Giấy chứng nhận OCOP thành công',
            status: 201
        );
    }

    public function download(string $id)
    {
        $fileInfo = $this->documentService->downloadDocument($id);

        return response($fileInfo['content'], 200, [
            'Content-Type' => $fileInfo['mime_type'],
            'Content-Disposition' => 'inline; filename="' . $fileInfo['file_name'] . '"',
        ]);
    }
}
