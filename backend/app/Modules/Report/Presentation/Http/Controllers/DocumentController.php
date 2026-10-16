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

    public function generateForm01(string $applicationId, Request $request): JsonResponse
    {
        $requestedBy = auth()->id() ?: 'SYSTEM';
        $document = $this->documentService->generateForm01Html($applicationId, $requestedBy);

        return $this->success(
            data: new GeneratedDocumentResource($document),
            message: 'Kết xuất Biểu số 01 (Phiếu đăng ký đánh giá phân hạng OCOP) thành công',
            status: 201
        );
    }

    public function generateForm02(string $applicationId, Request $request): JsonResponse
    {
        $requestedBy = auth()->id() ?: 'SYSTEM';
        $document = $this->documentService->generateForm02Html($applicationId, $requestedBy);

        return $this->success(
            data: new GeneratedDocumentResource($document),
            message: 'Kết xuất Biểu số 02 (Báo cáo tự đánh giá sản phẩm OCOP) thành công',
            status: 201
        );
    }

    public function generateForm03(string $applicationId, Request $request): JsonResponse
    {
        $requestedBy = auth()->id() ?: 'SYSTEM';
        $document = $this->documentService->generateForm03Html($applicationId, $requestedBy);

        return $this->success(
            data: new GeneratedDocumentResource($document),
            message: 'Kết xuất Biểu số 03 (Báo cáo đánh giá của UBND cấp xã) thành công',
            status: 201
        );
    }

    public function previewForm01(string $applicationId, Request $request)
    {
        $html = $this->documentService->getForm01PreviewHtml($applicationId);

        if ($request->wantsJson() && !$request->has('raw')) {
            return $this->success(
                data: ['html' => $html, 'document_type' => 'OCOP_FORM_01'],
                message: 'Tải xem trước Biểu số 01 thành công'
            );
        }

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    public function previewForm02(string $applicationId, Request $request)
    {
        $html = $this->documentService->getForm02PreviewHtml($applicationId);

        if ($request->wantsJson() && !$request->has('raw')) {
            return $this->success(
                data: ['html' => $html, 'document_type' => 'OCOP_FORM_02'],
                message: 'Tải xem trước Biểu số 02 thành công'
            );
        }

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    public function previewForm03(string $applicationId, Request $request)
    {
        $html = $this->documentService->getForm03PreviewHtml($applicationId);

        if ($request->wantsJson() && !$request->has('raw')) {
            return $this->success(
                data: ['html' => $html, 'document_type' => 'OCOP_FORM_03'],
                message: 'Tải xem trước Biểu số 03 thành công'
            );
        }

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
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
