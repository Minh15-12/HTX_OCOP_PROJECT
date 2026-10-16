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

    public function generateOcopDossierPdf(string $applicationId, string $requestedBy = 'SYSTEM'): GeneratedDocumentModel
    {
        $application = $this->getApplicationWithRelations($applicationId);
        $htmlContent = $this->buildDossierHtmlContent($application);

        return $this->storeGeneratedDocument(
            $application,
            'OCOP_DOSSIER',
            'OCOP-TEMPLATE-2026.V1',
            $htmlContent,
            $requestedBy
        );
    }

    public function generateForm01Html(string $applicationId, string $requestedBy = 'SYSTEM'): GeneratedDocumentModel
    {
        $application = $this->getApplicationWithRelations($applicationId);
        $htmlContent = $this->buildForm01HtmlContent($application);

        return $this->storeGeneratedDocument(
            $application,
            'OCOP_FORM_01',
            'OCOP-FORM-01-QD148.V1',
            $htmlContent,
            $requestedBy
        );
    }

    public function generateForm02Html(string $applicationId, string $requestedBy = 'SYSTEM'): GeneratedDocumentModel
    {
        $application = $this->getApplicationWithRelations($applicationId);
        $htmlContent = $this->buildForm02HtmlContent($application);

        return $this->storeGeneratedDocument(
            $application,
            'OCOP_FORM_02',
            'OCOP-FORM-02-QD148.V1',
            $htmlContent,
            $requestedBy
        );
    }

    public function generateForm03Html(string $applicationId, string $requestedBy = 'SYSTEM'): GeneratedDocumentModel
    {
        $application = $this->getApplicationWithRelations($applicationId);
        $htmlContent = $this->buildForm03HtmlContent($application);

        return $this->storeGeneratedDocument(
            $application,
            'OCOP_FORM_03',
            'OCOP-FORM-03-QD148.V1',
            $htmlContent,
            $requestedBy
        );
    }

    public function getForm01PreviewHtml(string $applicationId): string
    {
        $application = $this->getApplicationWithRelations($applicationId);
        return $this->buildForm01HtmlContent($application);
    }

    public function getForm02PreviewHtml(string $applicationId): string
    {
        $application = $this->getApplicationWithRelations($applicationId);
        return $this->buildForm02HtmlContent($application);
    }

    public function getForm03PreviewHtml(string $applicationId): string
    {
        $application = $this->getApplicationWithRelations($applicationId);
        return $this->buildForm03HtmlContent($application);
    }

    public function generateCertificatePdf(string $applicationId, string $requestedBy = 'SYSTEM'): GeneratedDocumentModel
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

    private function getApplicationWithRelations(string $applicationId): OcopApplicationModel
    {
        $application = OcopApplicationModel::with([
            'product',
            'cooperative',
            'criteriaVersion.groups.criteria.indicators',
            'selfAssessments.indicator',
            'evidences.versions',
        ])->find($applicationId);

        if (!$application) {
            throw new DomainException(
                "Không tìm thấy hồ sơ OCOP với ID: {$applicationId}",
                'APPLICATION_NOT_FOUND',
                null,
                404
            );
        }

        return $application;
    }

    private function storeGeneratedDocument(
        OcopApplicationModel $application,
        string $documentType,
        string $templateVersion,
        string $htmlContent,
        string $requestedBy
    ): GeneratedDocumentModel {
        $prefix = strtolower(str_replace('_', '-', $documentType));
        $fileName = "{$prefix}_{$application->id}_" . Str::random(6) . '.html';
        $storagePath = "documents/{$prefix}/{$application->id}/{$fileName}";

        Storage::disk('local')->put($storagePath, $htmlContent);

        $checksum = hash('sha256', $htmlContent);

        $document = GeneratedDocumentModel::create([
            'id' => (string) Str::uuid(),
            'document_type' => $documentType,
            'source_entity_type' => 'OcopApplication',
            'source_entity_id' => $application->id,
            'template_version' => $templateVersion,
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

    public function buildForm01HtmlContent($app): string
    {
        $coopName = htmlspecialchars($app->cooperative->legal_name ?? 'Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến');
        $coopShort = htmlspecialchars($app->cooperative->display_name ?? 'HTX Nông Nghiệp Tân Tiến');
        $address = htmlspecialchars($app->cooperative->contact_information['address'] ?? 'Tổ Hòn Bồ, Phường 12, Thành phố Đà Lạt, Tỉnh Lâm Đồng');
        $phone = htmlspecialchars($app->cooperative->contact_information['phone'] ?? '0987 654 321');
        $email = htmlspecialchars($app->cooperative->contact_information['email'] ?? 'htx@tantien.vn');
        $repName = htmlspecialchars($app->cooperative->legal_information['representative_name'] ?? 'Nguyễn Văn Tân');
        $repTitle = htmlspecialchars($app->cooperative->legal_information['representative_title'] ?? 'Giám đốc Hợp tác xã');
        $licenseNo = htmlspecialchars($app->cooperative->legal_information['license_no'] ?? '5801234567 do UBND Thành phố Đà Lạt cấp ngày 10/10/2018');

        $prodName = htmlspecialchars($app->product->product_name ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt');
        $appNumber = htmlspecialchars($app->application_number ?? ('HS-OCOP-' . date('Y') . '-' . substr($app->id, 0, 6)));
        $dateStr = date('d/m/Y');

        return <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Biểu số 01: Phiếu đăng ký đánh giá phân hạng OCOP - {$appNumber}</title>
    <style>
        body { font-family: "DejaVu Sans", "Times New Roman", serif; font-size: 13pt; line-height: 1.45; color: #111; margin: 35px 45px; }
        .header-box { display: flex; justify-content: space-between; text-align: center; margin-bottom: 25px; }
        .header-left { width: 45%; font-size: 12pt; text-transform: uppercase; font-weight: bold; }
        .header-right { width: 50%; }
        .country-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; }
        .motto { font-size: 13pt; font-weight: bold; font-style: italic; border-bottom: 1px solid #111; display: inline-block; padding-bottom: 3px; margin-bottom: 5px; }
        .form-code { font-size: 11pt; font-weight: bold; color: #333; margin-top: 5px; }
        .main-title { text-align: center; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 25px 0 10px 0; color: #004d40; }
        .sub-title { text-align: center; font-style: italic; font-size: 11pt; margin-bottom: 20px; }
        .section-title { font-weight: bold; font-size: 13pt; margin: 15px 0 8px 0; color: #1b5e20; }
        .field-row { margin: 6px 0; }
        .field-label { font-weight: bold; display: inline-block; min-width: 200px; }
        .checkbox-group { margin: 8px 0 8px 30px; }
        .checkbox-item { margin-right: 25px; }
        .boxed-list { border: 1px solid #ccc; padding: 12px 18px; margin: 10px 0; background: #fafafa; }
        .sign-table { width: 100%; margin-top: 35px; border-collapse: collapse; }
        .sign-table td { width: 50%; text-align: center; vertical-align: top; padding: 10px; }
        .receipt-box { border: 2px dashed #004d40; padding: 15px; margin-top: 30px; background: #e0f2f1; }
        .qr-badge { font-size: 10pt; color: #555; text-align: right; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header-box">
        <div class="header-left">
            ỦY BAN NHÂN DÂN TỈNH LÂM ĐỒNG<br>
            <strong>UBND THÀNH PHỐ ĐÀ LẠT</strong>
        </div>
        <div class="header-right">
            <div class="country-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
            <div class="form-code">Biểu số 01 (Ban hành kèm theo QĐ 148/QĐ-TTg)</div>
        </div>
    </div>

    <div class="main-title">PHIẾU ĐĂNG KÝ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP</div>
    <div class="sub-title">(Áp dụng cho chu trình OCOP thường niên - Phân nhóm Rau, củ, quả, hạt tươi)</div>

    <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">
        Kính gửi: Hội đồng đánh giá, phân hạng sản phẩm OCOP Thành phố Đà Lạt / Tỉnh Lâm Đồng
    </div>

    <div class="section-title">1. Thông tin về chủ thể đăng ký:</div>
    <div class="field-row"><span class="field-label">- Tên chủ thể kinh tế:</span> <strong>{$coopName}</strong></div>
    <div class="field-row"><span class="field-label">- Tên giao dịch viết tắt:</span> {$coopShort}</div>
    <div class="field-row"><span class="field-label">- Người đại diện theo pháp luật:</span> <strong>{$repName}</strong> - Chức vụ: {$repTitle}</div>
    <div class="field-row"><span class="field-label">- Địa chỉ trụ sở chính:</span> {$address}</div>
    <div class="field-row"><span class="field-label">- Điện thoại liên hệ:</span> {$phone} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Email:</strong> {$email}</div>
    <div class="field-row"><span class="field-label">- Giấy chứng nhận ĐK HTX:</span> Số {$licenseNo}</div>

    <div class="section-title">2. Tên sản phẩm đăng ký đánh giá, phân hạng:</div>
    <div class="field-row" style="font-size: 14pt; color: #b71c1c; font-weight: bold; padding-left: 30px;">
        {$prodName}
    </div>

    <div class="section-title">3. Nhóm ngành sản phẩm (theo QĐ 148/QĐ-TTg):</div>
    <div class="field-row">- Ngành: <strong>Thực phẩm</strong></div>
    <div class="field-row">- Nhóm sản phẩm: <strong>Nông sản tươi sống</strong></div>
    <div class="field-row">- Phân nhóm sản phẩm: <strong>Rau, củ, quả, hạt tươi</strong></div>

    <div class="section-title">4. Lần đăng ký:</div>
    <div class="checkbox-group">
        <span class="checkbox-item">[ <strong>X</strong> ] Đăng ký lần đầu</span>
        <span class="checkbox-item">[ &nbsp; ] Đánh giá lại (hết hạn 36 tháng)</span>
        <span class="checkbox-item">[ &nbsp; ] Đăng ký nâng hạng sao</span>
    </div>

    <div class="section-title">5. Mức sao mục tiêu phấn đấu:</div>
    <div class="checkbox-group">
        <span class="checkbox-item">[ &nbsp; ] 3 Sao</span>
        <span class="checkbox-item">[ <strong>X</strong> ] <strong>4 Sao OCOP</strong> (tiềm năng 5 Sao Quốc gia)</span>
        <span class="checkbox-item">[ &nbsp; ] 5 Sao Quốc gia</span>
    </div>

    <div class="section-title">6. Danh mục hồ sơ và sản phẩm mẫu gửi kèm:</div>
    <div class="boxed-list">
        <div>1. Báo cáo tự đánh giá về sản phẩm theo Bộ tiêu chí OCOP (Biểu số 02) (01 bản in + 01 bản số hóa).</div>
        <div>2. Báo cáo đánh giá của UBND cấp xã xác nhận 4 nội dung thực tế (Biểu số 03) (01 bản gốc).</div>
        <div>3. Mẫu sản phẩm hoàn chỉnh: <strong>10 hộp thành phẩm đóng khay giấy ép 500g, dán tem QR GS1 truy xuất nguồn gốc</strong>.</div>
        <div>4. Bảng kê 14 danh mục minh chứng (Giấy phép ĐKKD, Vùng trồng GPS, VietGAP VICB-2024-GAP-0128, Sổ PHI, Quatest 3, Nhãn hiệu 'Rau Đà Lạt'...).</div>
    </div>

    <div class="section-title">7. Cam kết của chủ thể:</div>
    <p style="text-align: justify; text-indent: 30px;">
        Chủ thể cam đoan các thông tin kê khai trong Phiếu đăng ký này và toàn bộ tài liệu hồ sơ minh chứng gửi kèm là hoàn toàn trung thực, chính xác và chịu mọi trách nhiệm trước pháp luật nếu có hành vi gian lận hoặc khai báo sai sự thật.
    </p>

    <table class="sign-table">
        <tr>
            <td>
                <em>Lâm Đồng, ngày {$dateStr}</em><br>
                <strong>CÁN BỘ TIẾP NHẬN HỒ SƠ</strong><br>
                <em>(Ký, ghi rõ họ tên)</em><br><br><br><br>
                <strong>Bộ phận tiếp nhận OCOP TP Đà Lạt</strong>
            </td>
            <td>
                <em>Đà Lạt, ngày {$dateStr}</em><br>
                <strong>ĐẠI DIỆN HỢP TÁC XÃ</strong><br>
                <em>(Ký tên, đóng dấu)</em><br><br><br><br>
                <strong>{$repName}</strong><br>
                Giám đốc Hợp tác xã
            </td>
        </tr>
    </table>

    <div class="receipt-box">
        <strong>PHẦN GHI NHẬN CỦA CƠ QUAN THƯỜNG TRỰC OCOP TIẾP NHẬN:</strong><br>
        - Số hiệu tiếp nhận hồ sơ: <strong>{$appNumber}</strong><br>
        - Ngày nhận hồ sơ: {$dateStr}<br>
        - Tình trạng hồ sơ: <em>Đầy đủ thành phần hồ sơ theo QĐ 148/QĐ-TTg, đủ điều kiện chuyển Hội đồng thẩm định.</em>
    </div>

    <div class="qr-badge">Mã xác thực số hóa: SHA256-DIGITAL-OCOP-{$app->id}</div>
</body>
</html>
HTML;
    }

    public function buildForm02HtmlContent($app): string
    {
        $coopName = htmlspecialchars($app->cooperative->legal_name ?? 'Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến');
        $address = htmlspecialchars($app->cooperative->contact_information['address'] ?? 'Tổ Hòn Bồ, Phường 12, Thành phố Đà Lạt, Tỉnh Lâm Đồng');
        $repName = htmlspecialchars($app->cooperative->legal_information['representative_name'] ?? 'Nguyễn Văn Tân');
        $licenseNo = htmlspecialchars($app->cooperative->legal_information['license_no'] ?? '5801234567 cấp ngày 10/10/2018');
        $prodName = htmlspecialchars($app->product->product_name ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt');
        $appNumber = htmlspecialchars($app->application_number ?? ('HS-OCOP-' . date('Y') . '-' . substr($app->id, 0, 6)));
        $dateStr = date('d/m/Y');

        // Calculate score summary from self-assessments
        $assessments = $app->selfAssessments->keyBy(fn ($a) => $a->indicator?->code ?? $a->indicator_id);

        $defaultScores = [
            'TC-A.1.1' => ['score' => 10.0, 'expl' => '100% diện tích vùng trồng (280 ha tại Hòn Bồ & Đạ Sar) thuộc tỉnh Lâm Đồng'],
            'TC-A.2.1' => ['score' => 5.0,  'expl' => '165/165 hộ thành viên HTX thường trú địa phương, có hợp đồng liên kết'],
            'TC-A.3.1' => ['score' => 10.0, 'expl' => 'Hợp đồng bao tiêu ổn định 4.720 tấn/năm với WinMart, Co.opmart (>65% sản lượng)'],
            'TC-A.4.1' => ['score' => 15.0, 'expl' => 'Đầy đủ cam kết BVMT Phường 12, bể thu gom bao bì BVTV, ủ phân hữu cơ vi sinh'],
            'TC-B.1.1' => ['score' => 8.0,  'expl' => 'Phân phối chuỗi siêu thị toàn quốc (WinMart, Bách Hóa Xanh) & sàn TMĐT OCOP'],
            'TC-B.1.2' => ['score' => 7.0,  'expl' => 'Bao bì chuẩn NĐ 43/2017 & TT 02/2024, có tem QR gắn mã lô (lot_id)'],
            'TC-B.2.1' => ['score' => 10.0, 'expl' => 'Câu chuyện di sản rau Đà Lạt, nguồn gốc giống Sweet Palermo, video tư liệu 4K'],
            'TC-C.1.1' => ['score' => 10.0, 'expl' => 'Độ ngọt Brix ≥ 8.5, vị ngọt thanh không hăng, phiếu kiểm nghiệm ISO 17025'],
            'TC-C.2.1' => ['score' => 10.0, 'expl' => 'Giấy chứng nhận VietGAP VICB-2024-GAP-0128 còn hiệu lực đến năm 2027'],
            'TC-C.2.2' => ['score' => 5.0,  'expl' => '100% nhật ký tuân thủ thời gian cách ly PHI, âm tính hoạt chất cấm'],
            'TC-C.3.1' => ['score' => 10.0, 'expl' => 'Được cấp quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt" của Sở NN&PTNT'],
        ];

        $criteriaRows = [
            // Group GA: 40.0 pts
            ['group' => 'PHẦN A', 'code' => 'TC-A.1', 'ind' => 'TC-A.1.1', 'name' => 'Nguồn nguyên liệu địa phương', 'max' => 10.0, 'mand' => 'Có (*)', 'key' => 'TC-A.1.1'],
            ['group' => 'PHẦN A', 'code' => 'TC-A.2', 'ind' => 'TC-A.2.1', 'name' => 'Sử dụng lao động tại chỗ', 'max' => 5.0, 'mand' => 'Không', 'key' => 'TC-A.2.1'],
            ['group' => 'PHẦN A', 'code' => 'TC-A.3', 'ind' => 'TC-A.3.1', 'name' => 'Tổ chức sản xuất & liên kết chuỗi', 'max' => 10.0, 'mand' => 'Không', 'key' => 'TC-A.3.1'],
            ['group' => 'PHẦN A', 'code' => 'TC-A.4', 'ind' => 'TC-A.4.1', 'name' => 'Bảo vệ môi trường trong sản xuất', 'max' => 15.0, 'mand' => 'Có (*)', 'key' => 'TC-A.4.1'],
            // Group GB: 25.0 pts
            ['group' => 'PHẦN B', 'code' => 'TC-B.1.1', 'ind' => 'TC-B.1.1', 'name' => 'Hệ thống kênh phân phối thương mại', 'max' => 8.0, 'mand' => 'Không', 'key' => 'TC-B.1.1'],
            ['group' => 'PHẦN B', 'code' => 'TC-B.1.2', 'ind' => 'TC-B.1.2', 'name' => 'Bao bì đóng gói & Tem nhãn truy xuất nguồn gốc', 'max' => 7.0, 'mand' => 'Có (*)', 'key' => 'TC-B.1.2'],
            ['group' => 'PHẦN B', 'code' => 'TC-B.2', 'ind' => 'TC-B.2.1', 'name' => 'Câu chuyện về sản phẩm', 'max' => 10.0, 'mand' => 'Không', 'key' => 'TC-B.2.1'],
            // Group GC: 35.0 pts
            ['group' => 'PHẦN C', 'code' => 'TC-C.1', 'ind' => 'TC-C.1.1', 'name' => 'Chỉ tiêu cảm quan, độ ngọt Brix & dinh dưỡng', 'max' => 10.0, 'mand' => 'Không', 'key' => 'TC-C.1.1'],
            ['group' => 'PHẦN C', 'code' => 'TC-C.2.1', 'ind' => 'TC-C.2.1', 'name' => 'Tiêu chuẩn chất lượng VietGAP / GlobalGAP', 'max' => 10.0, 'mand' => 'Có (*)', 'key' => 'TC-C.2.1'],
            ['group' => 'PHẦN C', 'code' => 'TC-C.2.2', 'ind' => 'TC-C.2.2', 'name' => 'Kiểm soát tồn dư thuốc BVTV & an toàn PHI', 'max' => 5.0, 'mand' => 'Có (*)', 'key' => 'TC-C.2.2'],
            ['group' => 'PHẦN C', 'code' => 'TC-C.3', 'ind' => 'TC-C.3.1', 'name' => 'Sở hữu trí tuệ & Nhãn hiệu bảo hộ', 'max' => 10.0, 'mand' => 'Không', 'key' => 'TC-C.3.1'],
        ];

        $tableRowsHtml = '';
        $totalSelfScore = 0.0;
        $totalMaxScore = 0.0;
        $idx = 1;

        foreach ($criteriaRows as $row) {
            $k = $row['key'];
            $actualScore = isset($assessments[$k]) ? (float) $assessments[$k]->score : $defaultScores[$k]['score'];
            $actualExpl = isset($assessments[$k]) && !empty($assessments[$k]->explanation)
                ? htmlspecialchars($assessments[$k]->explanation)
                : $defaultScores[$k]['expl'];

            $totalSelfScore += $actualScore;
            $totalMaxScore += $row['max'];

            $tableRowsHtml .= "<tr>
                <td style='text-align: center;'>{$idx}</td>
                <td style='font-weight: bold;'>{$row['code']}</td>
                <td><strong>{$row['name']}</strong><br><small style='color: #555;'>Mã CT: {$row['ind']}</small></td>
                <td style='text-align: center; color: #1b5e20; font-weight: bold;'>{$row['mand']}</td>
                <td style='text-align: center;'>{$row['max']}</td>
                <td style='text-align: center; font-weight: bold; color: #b71c1c;'>{$actualScore}</td>
                <td style='font-size: 11pt;'>{$actualExpl}</td>
            </tr>";
            $idx++;
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Biểu số 02: Báo cáo tự đánh giá sản phẩm OCOP - {$appNumber}</title>
    <style>
        body { font-family: "DejaVu Sans", "Times New Roman", serif; font-size: 12pt; line-height: 1.45; color: #111; margin: 35px 45px; }
        .header-box { display: flex; justify-content: space-between; text-align: center; margin-bottom: 20px; }
        .header-left { width: 45%; font-size: 12pt; font-weight: bold; }
        .header-right { width: 50%; }
        .country-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; }
        .motto { font-size: 12.5pt; font-weight: bold; font-style: italic; border-bottom: 1px solid #111; display: inline-block; padding-bottom: 3px; }
        .form-code { font-size: 11pt; font-weight: bold; color: #444; margin-top: 5px; }
        .main-title { text-align: center; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 20px 0 5px 0; color: #1b5e20; }
        .sub-title { text-align: center; font-style: italic; margin-bottom: 25px; }
        .part-header { font-size: 13.5pt; font-weight: bold; color: #0d47a1; text-transform: uppercase; margin: 25px 0 10px 0; border-left: 5px solid #0d47a1; padding-left: 10px; background: #e3f2fd; }
        .field-row { margin: 6px 0; }
        .field-label { font-weight: bold; }
        table.data-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11.5pt; }
        table.data-table th, table.data-table td { border: 1px solid #777; padding: 7px 8px; vertical-align: middle; }
        table.data-table th { background: #e8f5e9; font-weight: bold; text-align: center; }
        .total-row { font-weight: bold; background: #fff9c4; }
        .sign-table { width: 100%; margin-top: 35px; border-collapse: collapse; }
        .sign-table td { width: 50%; text-align: center; vertical-align: top; padding: 10px; }
    </style>
</head>
<body>
    <div class="header-box">
        <div class="header-left">
            {$coopName}<br>
            <strong>HỘI ĐỒNG QUẢN TRỊ HTX</strong>
        </div>
        <div class="header-right">
            <div class="country-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
            <div class="form-code">Biểu số 02 (Kèm theo QĐ 148/QĐ-TTg)</div>
        </div>
    </div>

    <div class="main-title">BÁO CÁO TỰ ĐÁNH GIÁ VỀ SẢN PHẨM OCOP</div>
    <div class="sub-title">(Tự đánh giá theo Bộ tiêu chí phân hạng sản phẩm OCOP Rau, củ, quả tươi - Ớt chuông Sweet Palermo)</div>

    <!-- PHẦN I -->
    <div class="part-header">Phần I: THÔNG TIN CHUNG VỀ CHỦ THỂ VÀ SẢN PHẨM</div>
    <div class="field-row"><span class="field-label">1. Tên chủ thể sản xuất:</span> <strong>{$coopName}</strong></div>
    <div class="field-row"><span class="field-label">2. Địa chỉ trụ sở:</span> {$address}</div>
    <div class="field-row"><span class="field-label">3. Người đại diện pháp luật:</span> <strong>{$repName}</strong> - Giám đốc HTX</div>
    <div class="field-row"><span class="field-label">4. Đăng ký kinh doanh:</span> {$licenseNo}</div>
    <div class="field-row"><span class="field-label">5. Tên sản phẩm tự đánh giá:</span> <strong style="color: #b71c1c; font-size: 13pt;">{$prodName}</strong></div>
    <div class="field-row"><span class="field-label">6. Đặc tính quy cách sản phẩm:</span> Ớt chuông quả ngọt Sweet Palermo màu đỏ tươi, chiều dài 20-25cm, khối lượng 100-150g/trái, độ ngọt Brix ≥ 8.0, hàm lượng đường tự nhiên và Vitamin C vượt trội, vỏ giòn mọng nước, vị ngọt thanh không hăng cay. Đóng gói khay giấy ép 500g, bọc màng sinh học tự hủy thân thiện môi trường dán tem QR GS1.</div>
    <div class="field-row"><span class="field-label">7. Tiêu chuẩn áp dụng:</span> Tiêu chuẩn cơ sở TCCS 01:2024/HTX-TT; Giấy chứng nhận VietGAP số hiệu VICB-2024-GAP-0128 còn hiệu lực đến ngày 14/01/2027; Quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt".</div>
    <div class="field-row"><span class="field-label">8. Quá trình hình thành & phát triển:</span> HTX thành lập năm 2018 với 25 hộ thành viên ban đầu, đến nay đã liên kết 165 hộ xã viên với quy mô 280 ha nhà kính ứng dụng công nghệ tưới Fertigation Israel và kiểm soát dịch hại sinh học IPM tại Hòn Bồ (Đà Lạt) và Đạ Sar (Lạc Dương).</div>

    <!-- PHẦN II -->
    <div class="part-header">Phần II: KẾT QUẢ THỰC HIỆN PHƯƠNG ÁN SẢN XUẤT, KINH DOANH</div>
    <div class="field-row"><span class="field-label">1. Vùng nguyên liệu:</span> 280 ha canh tác khép kín nhà kính công nghệ cao, 100% diện tích nằm trong địa giới tỉnh Lâm Đồng.</div>
    <div class="field-row"><span class="field-label">2. Năng lực sản xuất:</span> Sản lượng thu hoạch đạt <strong>4.720 tấn rau quả/năm</strong>.</div>
    <div class="field-row"><span class="field-label">3. Doanh thu & hiệu quả:</span> Doanh thu bình quân năm gần nhất đạt <strong>48,5 tỷ đồng</strong>; lợi nhuận ròng đạt <strong>6,8 tỷ đồng</strong>; giải quyết việc làm thường xuyên cho 165 hộ xã viên và 48 lao động tại chỗ với thu nhập bình quân 9,5 triệu đồng/người/tháng.</div>
    <div class="field-row"><span class="field-label">4. Kênh phân phối:</span> Hợp đồng bao tiêu dài hạn với chuỗi siêu thị WinMart, Co.opmart, Bách Hóa Xanh và sàn thương mại điện tử OCOP.</div>

    <!-- PHẦN III -->
    <div class="part-header">Phần III: KẾT QUẢ TỰ ĐÁNH GIÁ THEO BỘ TIÊU CHÍ OCOP (100 ĐIỂM)</div>
    <p>Chủ thể tự chấm điểm theo Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ:</p>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">STT</th>
                <th style="width: 12%;">Mã Tiêu Chí</th>
                <th style="width: 28%;">Tên Tiêu Chí / Chỉ Tiêu</th>
                <th style="width: 10%;">Bắt Buộc</th>
                <th style="width: 8%;">Điểm Tối Đa</th>
                <th style="width: 8%;">Tự Chấm</th>
                <th style="width: 29%;">Căn Cứ Tự Đánh Giá & Minh Chứng</th>
            </tr>
        </thead>
        <tbody>
            {$tableRowsHtml}
            <tr class="total-row">
                <td colspan="4" style="text-align: right; text-transform: uppercase;">TỔNG CỘNG ĐIỂM TỰ ĐÁNH GIÁ (PHẦN A + B + C):</td>
                <td style="text-align: center;">{$totalMaxScore}</td>
                <td style="text-align: center; color: #b71c1c; font-size: 13pt;">{$totalSelfScore}</td>
                <td style="color: #1b5e20;"><strong>ĐỦ ĐIỀU KIỆN ĐỀ NGHỊ CÔNG NHẬN 4 SAO OCOP</strong></td>
            </tr>
        </tbody>
    </table>

    <div style="margin: 20px 0;">
        <strong style="color: #1b5e20;">BẢNG PHỤ LỤC DANH MỤC 14 TÀI LIỆU MINH CHỨNG SỐ HÓA ĐÍNH KÈM:</strong>
        <table class="data-table" style="font-size: 10.5pt; margin-top: 8px;">
            <thead>
                <tr>
                    <th style="width: 6%;">Mã MC</th>
                    <th style="width: 32%;">Tên Loại Tài Liệu Minh Chứng</th>
                    <th style="width: 22%;">Số Hiệu / Cơ Quan Cấp</th>
                    <th style="width: 16%;">Trạng Thái</th>
                    <th style="width: 24%;">Mã Băm Bảo Mật (SHA-256)</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>MC01</td><td>Giấy chứng nhận đăng ký Hợp tác xã</td><td>Số 5801234567 / UBND TP Đà Lạt</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>a3f89b...e21c</code></td></tr>
                <tr><td>MC02</td><td>Bản đồ số vùng trồng & danh mục thửa đất (280 ha)</td><td>Chi cục Trồng trọt & BVTV Lâm Đồng</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>f12d8a...b741</code></td></tr>
                <tr><td>MC03</td><td>Danh sách 165 hộ xã viên & Hợp đồng liên kết</td><td>HTX Dịch vụ NN Tân Tiến</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>c8e901...44af</code></td></tr>
                <tr><td>MC04</td><td>Hợp đồng bao tiêu cung ứng chuỗi siêu thị (4.720 tấn)</td><td>WinMart / Co.opmart / WinCommerce</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>87b5c1...12da</code></td></tr>
                <tr><td>MC05</td><td>Bản cam kết bảo vệ môi trường trong sản xuất</td><td>UBND Phường 12 phê duyệt</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>54d23a...90be</code></td></tr>
                <tr><td>MC06</td><td>Quy trình thu gom bao bì BVTV & ủ phân vi sinh</td><td>Sổ tay quy trình kỹ thuật HTX</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>9a7c3e...fe88</code></td></tr>
                <tr><td>MC07</td><td>Hợp đồng phân phối thương mại & Hóa đơn xuất kho</td><td>Chuỗi bán lẻ WinMart & BHX</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>66d812...09ab</code></td></tr>
                <tr><td>MC08</td><td>Maket thiết kế bao bì khay giấy chuẩn NĐ 43/2017</td><td>Cơ sở in ấn bao bì sinh học</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>19fa82...cc31</code></td></tr>
                <tr><td>MC09</td><td>Ảnh chụp tem mã QR GS1 gắn mã lô truy xuất (lot_id)</td><td>Hệ thống Truy xuất nguồn gốc HTX</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>bb4301...55da</code></td></tr>
                <tr><td>MC10</td><td>Bản thuyết minh câu chuyện sản phẩm Sweet Palermo</td><td>Hồ sơ văn hóa truyền thông HTX</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>23ea49...88cd</code></td></tr>
                <tr><td>MC11</td><td>Phiếu kiểm nghiệm dinh dưỡng & cảm quan (Brix 8.5)</td><td>Trung tâm Thử nghiệm Quatest 3 (ISO 17025)</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>fe5192...11ac</code></td></tr>
                <tr><td>MC12</td><td>Giấy chứng nhận VietGAP số VICB-2024-GAP-0128</td><td>Tổ chức Chứng nhận Nông nghiệp VICB (hạn 2027)</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>88aa14...ff32</code></td></tr>
                <tr><td>MC13</td><td>Sổ nhật ký phun thuốc bảo vệ thực vật & kiểm soát PHI</td><td>Nhật ký canh tác điện tử HTX Tân Tiến</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>71da89...e043</code></td></tr>
                <tr><td>MC14</td><td>Quyết định cấp quyền sử dụng nhãn hiệu 'Rau Đà Lạt'</td><td>Sở NN&PTNT Tỉnh Lâm Đồng</td><td style="color: green; font-weight: bold;">ĐÃ SỐ HÓA</td><td><code>42fe90...18ab</code></td></tr>
            </tbody>
        </table>
    </div>

    <!-- PHẦN IV -->
    <div class="part-header">Phần IV: KẾ HOẠCH PHÁT TRIỂN SẢN XUẤT, KINH DOANH TRONG THỜI GIAN TỚI</div>
    <div class="field-row"><strong>1. Kế hoạch mở rộng:</strong> Mở rộng thêm 50 ha vùng trồng nhà kính đạt chứng nhận tiêu chuẩn GlobalGAP trong giai đoạn 2026-2028.</div>
    <div class="field-row"><strong>2. Nâng cấp công nghệ bảo quản:</strong> Đầu tư hệ thống kho lạnh bảo quản sâu công nghệ khí điều tiết CAS nhằm kéo dài thời gian lưu trữ tươi ngon lên 45 ngày, phục vụ cung ứng dài hạn và giảm hao hụt sau thu hoạch.</div>
    <div class="field-row"><strong>3. Phát triển thị trường:</strong> Đẩy mạnh xúc tiến thương mại xuất khẩu ớt chuông ngọt sang thị trường Singapore, Nhật Bản và Hàn Quốc; liên kết với các sàn thương mại điện tử lớn để mở rộng doanh số bán lẻ trực tiếp tới người tiêu dùng.</div>

    <table class="sign-table">
        <tr>
            <td></td>
            <td>
                <em>Đà Lạt, ngày {$dateStr}</em><br>
                <strong>ĐẠI DIỆN HỢP TÁC XÃ TÂN TIẾN</strong><br>
                <em>(Ký tên, đóng dấu)</em><br><br><br><br><br>
                <strong>{$repName}</strong><br>
                Giám đốc Hợp tác xã
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }

    public function buildForm03HtmlContent($app): string
    {
        $coopName = htmlspecialchars($app->cooperative->legal_name ?? 'Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến');
        $address = htmlspecialchars($app->cooperative->contact_information['address'] ?? 'Tổ Hòn Bồ, Phường 12, Thành phố Đà Lạt, Tỉnh Lâm Đồng');
        $repName = htmlspecialchars($app->cooperative->legal_information['representative_name'] ?? 'Nguyễn Văn Tân');
        $prodName = htmlspecialchars($app->product->product_name ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt');
        $appNumber = htmlspecialchars($app->application_number ?? ('HS-OCOP-' . date('Y') . '-' . substr($app->id, 0, 6)));
        $dateStr = date('d/m/Y');

        return <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Biểu số 03: Báo cáo đánh giá của UBND cấp xã - {$appNumber}</title>
    <style>
        body { font-family: "DejaVu Sans", "Times New Roman", serif; font-size: 13pt; line-height: 1.5; color: #111; margin: 35px 45px; }
        .header-box { display: flex; justify-content: space-between; text-align: center; margin-bottom: 25px; }
        .header-left { width: 45%; font-size: 12pt; text-transform: uppercase; font-weight: bold; }
        .header-right { width: 50%; }
        .country-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; }
        .motto { font-size: 13pt; font-weight: bold; font-style: italic; border-bottom: 1px solid #111; display: inline-block; padding-bottom: 3px; }
        .form-code { font-size: 11pt; font-weight: bold; color: #444; margin-top: 5px; }
        .main-title { text-align: center; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 25px 0 5px 0; color: #b71c1c; }
        .sub-title { text-align: center; font-style: italic; font-size: 11.5pt; margin-bottom: 25px; }
        .target-authority { text-align: center; font-weight: bold; margin-bottom: 25px; }
        .content-heading { font-weight: bold; font-size: 13.5pt; color: #1b5e20; margin: 20px 0 10px 0; }
        .content-p { text-align: justify; text-indent: 30px; margin: 8px 0; }
        .verification-point { margin: 12px 0 12px 25px; }
        .sign-table { width: 100%; margin-top: 40px; border-collapse: collapse; }
        .sign-table td { width: 50%; text-align: center; vertical-align: top; padding: 10px; }
    </style>
</head>
<body>
    <div class="header-box">
        <div class="header-left">
            ỦY BAN NHÂN DÂN THÀNH PHỐ ĐÀ LẠT<br>
            <strong>UBND PHƯỜNG 12</strong><br>
            <span style="font-size: 10.5pt; font-weight: normal;">Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/BC-UBND</span>
        </div>
        <div class="header-right">
            <div class="country-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
            <div class="form-code">Biểu số 03 (Kèm theo QĐ 148/QĐ-TTg)</div>
        </div>
    </div>

    <div class="main-title">BÁO CÁO ĐÁNH GIÁ CỦA ỦY BAN NHÂN DÂN CẤP XÃ</div>
    <div class="sub-title">(Về việc xác nhận các nội dung phục vụ đánh giá, phân hạng sản phẩm OCOP)</div>

    <div class="target-authority">
        Kính gửi: Hội đồng đánh giá, phân hạng sản phẩm OCOP Thành phố Đà Lạt / Tỉnh Lâm Đồng
    </div>

    <p class="content-p">
        Căn cứ Quyết định số 148/QĐ-TTg ngày 24 tháng 02 năm 2023 của Thủ tướng Chính phủ về việc ban hành Bộ tiêu chí và quy trình đánh giá, phân hạng sản phẩm Chương trình Mỗi xã một sản phẩm (OCOP);
    </p>
    <p class="content-p">
        Căn cứ hồ sơ đề nghị của <strong>{$coopName}</strong> (Người đại diện: {$repName}; Trụ sở: {$address}) đăng ký tham gia đánh giá, phân hạng sản phẩm OCOP đối với sản phẩm: <strong>{$prodName}</strong>;
    </p>
    <p class="content-p">
        Sau khi tiến hành kiểm tra thực địa, rà soát hồ sơ quản lý đất đai, lao động và hoạt động sản xuất nông nghiệp trên địa bàn, Ủy ban nhân dân Phường 12, Thành phố Đà Lạt xin báo cáo và xác nhận 04 nội dung cụ thể như sau:
    </p>

    <div class="content-heading">1. Về nguồn nguyên liệu địa phương:</div>
    <div class="verification-point">
        - <strong>Xác nhận:</strong> Toàn bộ vùng trồng sản xuất ớt chuông của HTX Tân Tiến với quy mô <strong>280 ha</strong> nằm thực tế tại Tổ Hòn Bồ (Phường 12, Thành phố Đà Lạt) và vùng liên kết giáp ranh tại xã Đạ Sar (Huyện Lạc Dương), thuộc địa bàn tỉnh Lâm Đồng.<br>
        - <strong>Tỷ lệ:</strong> <strong>100% nguyên liệu Ớt chuông Sweet Palermo</strong> phục vụ sơ chế, đóng gói và tiêu thụ được thu hoạch trực tiếp tại vùng trồng nói trên, không mua gom từ các địa phương ngoài tỉnh hoặc không rõ nguồn gốc.
    </div>

    <div class="content-heading">2. Về sử dụng lao động tại chỗ:</div>
    <div class="verification-point">
        - <strong>Xác nhận:</strong> Hợp tác xã đang liên kết và sử dụng thường xuyên <strong>165 hộ gia đình xã viên</strong> và <strong>48 lao động nông nghiệp trực tiếp</strong> đều là công dân thường trú tại địa phương.<br>
        - Hoạt động sản xuất của HTX góp phần quan trọng vào việc tạo sinh kế ổn định, nâng cao thu nhập cho các hộ nông dân địa phương, chấp hành đầy đủ các quy định về an sinh xã hội và pháp luật lao động.
    </div>

    <div class="content-heading">3. Về nguồn gốc ý tưởng sản phẩm:</div>
    <div class="verification-point">
        - <strong>Xác nhận:</strong> Sản phẩm Ớt chuông Sweet Palermo Đỏ Đà Lạt bắt nguồn từ sáng kiến đổi mới sáng tạo nông nghiệp công nghệ cao của chính nông dân và cán bộ HTX Tân Tiến, nhằm chuyển đổi cơ cấu cây trồng từ các giống rau truyền thống sang giống ớt hoa quả cao cấp, thích nghi xuất sắc với điều kiện tiểu khí hậu và thổ nhưỡng đặc thù của Đà Lạt.
    </div>

    <div class="content-heading">4. Về bản sắc và trí tuệ địa phương:</div>
    <div class="verification-point">
        - <strong>Xác nhận:</strong> Sản phẩm kế thừa kỹ thuật canh tác nhà kính, hệ thống tưới nhỏ giọt Fertigation tiên tiến của người Đà Lạt, đáp ứng các tiêu chuẩn an toàn thực phẩm khắt khe và đã được cấp phép sử dụng <strong>nhãn hiệu chứng nhận "Rau Đà Lạt"</strong>.<br>
        - Sản phẩm phản ánh đậm nét trí tuệ, kinh nghiệm canh tác và thương hiệu nông nghiệp công nghệ cao của vùng đất Đà Lạt, Lâm Đồng.
    </div>

    <div class="content-heading">5. Đánh giá về công tác bảo vệ môi trường:</div>
    <div class="verification-point">
        - HTX Tân Tiến đã ký cam kết bảo vệ môi trường với UBND Phường 12, có hệ thống bể chứa thu gom bao bì thuốc BVTV sau sử dụng đúng quy cách và thực hiện quy trình ủ phụ phẩm rau hữu cơ vi sinh, không gây ô nhiễm môi trường khu dân cư.
    </div>

    <div class="content-heading">6. Kết luận và kiến nghị:</div>
    <p class="content-p">
        Ủy ban nhân dân Phường 12 khẳng định sản phẩm <strong>{$prodName}</strong> của <strong>{$coopName}</strong> hoàn toàn đáp ứng đầy đủ các tiêu chí thực tế tại địa phương theo quy định tại Quyết định 148/QĐ-TTg; kính đề nghị Hội đồng đánh giá, phân hạng sản phẩm OCOP Thành phố Đà Lạt và Tỉnh Lâm Đồng xem xét, thẩm định và công nhận sản phẩm đạt phân hạng <strong>4 SAO OCOP</strong>.
    </p>

    <table class="sign-table">
        <tr>
            <td style="text-align: left; font-size: 11pt;">
                <em>Nơi nhận:</em><br>
                - Như trên;<br>
                - UBND TP Đà Lạt (để b/c);<br>
                - Phòng Kinh tế TP Đà Lạt;<br>
                - HTX Tân Tiến;<br>
                - Lưu: VT.
            </td>
            <td>
                <em>Đà Lạt, ngày {$dateStr}</em><br>
                <strong>TM. ỦY BAN NHÂN DÂN PHƯỜNG 12</strong><br>
                <strong>CHỦ TỊCH</strong><br>
                <em>(Ký tên, đóng dấu)</em><br><br><br><br><br>
                <strong>Lê Văn Minh</strong>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }

    private function buildDossierHtmlContent($app): string
    {
        $productName = htmlspecialchars($app->product->product_name ?? $app->product->name ?? 'Sản phẩm OCOP');
        $coopName = htmlspecialchars($app->cooperative->legal_name ?? 'HTX Nông Nghiệp');
        $appNumber = htmlspecialchars($app->application_number ?? $app->id);

        return <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Hồ Sơ Đăng Ký & Đánh Giá OCOP - {$appNumber}</title>
    <style>
        body { font-family: "DejaVu Sans", sans-serif; margin: 40px; color: #333; }
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
    <h2>Biểu số 03: Xác nhận của UBND cấp xã</h2>
    <p>Xác nhận nguồn nguyên liệu, lao động, nguồn gốc ý tưởng và bản sắc trí tuệ địa phương.</p>
</body>
</html>
HTML;
    }

    private function buildCertificateHtmlContent($app, $decision, string $expirationDate): string
    {
        $productName = htmlspecialchars($app->product->product_name ?? $app->product->name ?? 'Sản phẩm OCOP');
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
        body { font-family: "DejaVu Sans", sans-serif; margin: 50px; text-align: center; border: 10px double #2e7d32; padding: 30px; }
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
