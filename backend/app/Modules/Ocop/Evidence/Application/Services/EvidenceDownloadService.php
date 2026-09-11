<?php

namespace Modules\Ocop\Evidence\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;

class EvidenceDownloadService
{
    public function __construct(
        private readonly EvidenceVersionService $versionService
    ) {}

    public function generateSignedUrl(string $evidenceId, int $expirationMinutes = 30): array
    {
        $evidence = $this->versionService->getEvidenceById($evidenceId);
        $version = $evidence->currentVersion;

        if (!$version) {
            throw new DomainException('Minh chứng chưa có phiên bản file vật lý', 'EVIDENCE_FILE_MISSING', null, 404);
        }

        // Generate temporary signed route URL
        $signedUrl = URL::temporarySignedRoute(
            'api.ocop.evidences.file-stream',
            now()->addMinutes($expirationMinutes),
            ['id' => $evidence->id]
        );

        return [
            'evidence_id' => $evidence->id,
            'file_name' => $version->file_name,
            'mime_type' => $version->mime_type,
            'file_size' => (int) $version->file_size,
            'checksum' => $version->checksum,
            'signed_url' => $signedUrl,
            'expires_at' => now()->addMinutes($expirationMinutes)->toIso8601String(),
        ];
    }

    public function getPhysicalFileStream(string $evidenceId)
    {
        $evidence = $this->versionService->getEvidenceById($evidenceId);
        $version = $evidence->currentVersion;

        if (!$version || !Storage::disk('local')->exists($version->file_reference)) {
            throw new DomainException('File vật lý không tồn tại trên hệ thống lưu trữ', 'FILE_NOT_FOUND', null, 404);
        }

        return Storage::disk('local')->response(
            $version->file_reference,
            $version->file_name,
            ['Content-Type' => $version->mime_type]
        );
    }
}
