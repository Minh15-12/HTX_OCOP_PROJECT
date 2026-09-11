<?php

namespace Modules\Report\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Ocop\Dossier\Infrastructure\Persistence\Models\OcopApplicationModel;
use Modules\Ocop\Evaluation\Infrastructure\Persistence\Models\FinalDecisionModel;
use Modules\Report\Infrastructure\Persistence\Models\GeneratedDocumentModel;

class OcopDocumentService
{
    public function __construct(
        private readonly AuditService $auditService
    ) {}

    public function generateOcopDossierPdf(string $applicationId, string $requestedBy): GeneratedDocumentModel
    {
        $application = OcopApplicationModel::with(['product', 'cooperative', 'selfAssessments', 'evidences.versions'])
            ->find($applicationId);

        if (!$application) {
            throw new DomainException(
                "Không tìm thấy hồ sơ OCOP với ID: {$applicationId}",
                'APPLICATION_NOT_FOUND',
                null,
                404
            );
        }

        // Generate Document HTML Content
        $htmlContent = $this->buildDossierHtmlContent($application);

        // Save file to local storage disk
        $extension = 'html'; // Rendered HTML / PDF document payload
        $fileName = "dossier_{$application->id}_" . Str::random(6) . ".{$extension}";
        $storagePath = "documents/dossiers/{$application->id}/{$fileName}";

        Storage::disk('local')->put($storagePath, $htmlContent);

        $checksum = hash('sha256', $htmlContent);

        $document = GeneratedDocumentModel::create([
            'id' => (string) Str::uuid(),
            'document_type' => 'OCOP_DOSSIER',
            'source_entity_type' => 'OcopApplication',
            'source_entity_id' => $application->id,
            'template_version' => 'OCOP-TEMPLATE-2026.V1',
            'source_data_version' => '1.0',
            'file_reference' => $storagePath,
            'checksum' => $checksum,
            'generated_at' => now(),
        ]);

        $this->auditService->log(
            action: 'DOCUMENT_GENERATED',
            entityType: 'GeneratedDocument',
            entityId: $document->id,
            after: $document->toArray(),
            actorId: $requestedBy,
            cooperativeId: $application->cooperative_id
        );

        return $document;
    }

    public function generateCertificatePdf(string $applicationId, string $requestedBy): GeneratedDocumentModel
    {
        $application = OcopApplicationModel::with(['product', 'cooperative'])->find($applicationId);

        if (!$application) {
            throw new DomainException(
                "Không tìm thấy hồ sơ OCOP với ID: {$applicationId}",
                'APPLICATION_NOT_FOUND',
                null,
                404
            );
        }

        $decision = FinalDecisionModel::where('application_id', $applicationId)
            ->latest('decision_date')
            ->first();

        if (!$decision || $application->status !== 'APPROVED') {
            throw new DomainException(
                'Hồ sơ OCOP chưa được cấp thẩm quyền phê duyệt chính thức (Trạng thái phải là APPROVED)',
                'APPLICATION_NOT_APPROVED',
                null,
                400
            );
        }

        // Calculate Expiration Date (36 months)
        $effectiveDate = $decision->effective_date ?? $decision->decision_date;
        $expirationDate = $effectiveDate ? $effectiveDate->addMonths(36)->format('d/m/Y') : '36 tháng';

        // Generate Certificate HTML / PDF Content
        $htmlContent = $this->buildCertificateHtmlContent($application, $decision, $expirationDate);

        $fileName = "certificate_{$application->id}_" . Str::random(6) . ".html";
        $storagePath = "documents/certificates/{$application->id}/{$fileName}";

        Storage::disk('local')->put($storagePath, $htmlContent);

        $checksum = hash('sha256', $htmlContent);

        $document = GeneratedDocumentModel::create([
            'id' => (string) Str::uuid(),
            'document_type' => 'OCOP_CERTIFICATE',
            'source_entity_type' => 'FinalDecision',
            'source_entity_id' => $decision->id,
            'template_version' => 'CERTIFICATE-TEMPLATE-2026.V1',
            'source_data_version' => '1.0',
            'file_reference' => $storagePath,
            'checksum' => $checksum,
            'generated_at' => now(),
        ]);

        $this->auditService->log(
            action: 'CERTIFICATE_GENERATED',
            entityType: 'GeneratedDocument',
            entityId: $document->id,
            after: $document->toArray(),
            actorId: $requestedBy,
            cooperativeId: $application->cooperative_id
        );

        return $document;
    }

    public function downloadDocument(string $documentId): array
    {
        $document = GeneratedDocumentModel::find($documentId);

        if (!$document) {
            throw new DomainException(
                "Không tìm thấy tài liệu với ID: {$documentId}",
                'DOCUMENT_NOT_FOUND',
                null,
                404
            );
        }

        if (!Storage::disk('local')->exists($document->file_reference)) {
            throw new DomainException(
                'Tệp tài liệu không tồn tại trên hệ thống lưu trữ',
                'DOCUMENT_FILE_NOT_FOUND',
                null,
                404
            );
        }

        $fullPath = Storage::disk('local')->path($document->file_reference);
        $content = Storage::disk('local')->get($document->file_reference);

        return [
            'document' => $document,
            'file_path' => $fullPath,
            'content' => $content,
            'mime_type' => 'text/html',
            'file_name' => basename($document->file_reference),
        ];
    }

    private function buildDossierHtmlContent($app): string
    {
        $productName = htmlspecialchars($app->product->name ?? 'Sản phẩm OCOP');
        $coopName = htmlspecialchars($app->cooperative->legal_name ?? 'HTX Nông Nghiệp');
        $appNumber = htmlspecialchars($app->application_number ?? $app->id);

        return <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Hồ Sơ Đăng Ký & Đánh Giá OCOP - {$appNumber}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; margin: 40px; color: #333; }
        h1 { color: #1b5e20; text-align: center; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .header-table td { padding: 8px; border: 1px solid #ddd; }
        .badge { background: #2e7d32; color: #fff; padding: 4px 8px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>BỘ HỒ SƠ ĐÁNH GIÁ VÀ PHÂN HẠNG SẢN PHẨM OCOP</h1>
    <table class="header-table">
        <tr><td><strong>Mã Số Hồ Sơ:</strong></td><td>{$appNumber}</td></tr>
        <tr><td><strong>Tên Sản Phẩm:</strong></td><td>{$productName}</td></tr>
        <tr><td><strong>Chủ Thể (HTX):</strong></td><td>{$coopName}</td></tr>
        <tr><td><strong>Trạng Thái:</strong></td><td><span class="badge">{$app->status}</span></td></tr>
    </table>
    <h2>Biểu số 01: Phiếu đăng ký sản phẩm OCOP</h2>
    <p>Đơn vị cam kết cung cấp đúng và đầy đủ thông tin minh chứng theo bộ tiêu chí quốc gia.</p>
    <h2>Biểu số 02: Bảng điểm tự đánh giá của Chủ thể</h2>
    <p>Tổng số chỉ tiêu đã tự đánh giá: {$app->selfAssessments->count()} chỉ tiêu.</p>
</body>
</html>
HTML;
    }

    private function buildCertificateHtmlContent($app, $decision, string $expirationDate): string
    {
        $productName = htmlspecialchars($app->product->name ?? 'Sản phẩm OCOP');
        $coopName = htmlspecialchars($app->cooperative->legal_name ?? 'HTX Nông Nghiệp');
        $decNumber = htmlspecialchars($decision->decision_number);
        $classification = htmlspecialchars($decision->final_classification);

        return <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Giấy Chứng Nhận OCOP - {$decNumber}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; margin: 50px; text-align: center; border: 10px double #2e7d32; padding: 30px; }
        h1 { color: #b71c1c; font-size: 28px; text-transform: uppercase; }
        h2 { color: #1b5e20; font-size: 24px; }
        .star-rating { font-size: 32px; color: #f57f17; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 14px; color: #555; }
    </style>
</head>
<body>
    <h1>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
    <h3>Độc lập - Tự do - Hạnh phúc</h3>
    <hr style="width: 200px; margin: 20px auto; border: 1px solid #1b5e20;">
    <h2>GIẤY CHỨNG NHẬN SẢN PHẨM OCOP</h2>
    <p>Chứng nhận sản phẩm:</p>
    <h3>{$productName}</h3>
    <p>Thuộc chủ thể: <strong>{$coopName}</strong></p>
    <p>Đã đạt chứng nhận phân hạng sản phẩm OCOP:</p>
    <div class="star-rating">★ HẠNG {$classification} ★</div>
    <p>Theo Quyết định số: <strong>{$decNumber}</strong></p>
    <p class="footer">Giấy chứng nhận có hiệu lực 36 tháng kể từ ngày ban hành (Thời hạn: {$expirationDate})</p>
</body>
</html>
HTML;
    }
}
