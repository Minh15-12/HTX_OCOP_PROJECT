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

        if (!$version) {
            throw new DomainException('Minh chứng chưa có phiên bản file vật lý', 'EVIDENCE_FILE_MISSING', null, 404);
        }

        // Path Traversal Defense
        $ref = $version->file_reference;
        if (str_contains($ref, '..') || str_starts_with($ref, '/') || str_starts_with($ref, '\\')) {
            throw new DomainException('Đường dẫn tệp vật lý không hợp lệ', 'INVALID_FILE_REFERENCE', null, 400);
        }

        $disk = config('filesystems.evidence_disk', 'local');

        if (!Storage::disk($disk)->exists($ref)) {
            // Check fallback on local disk if previously stored locally
            if (Storage::disk('local')->exists($ref)) {
                $disk = 'local';
            } else {
                throw new DomainException('File vật lý không tồn tại trên hệ thống lưu trữ', 'FILE_NOT_FOUND', null, 404);
            }
        }

        return Storage::disk($disk)->response(
            $ref,
            $version->file_name,
            [
                'Content-Type' => $version->mime_type,
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
            ]
        );
    }
}
