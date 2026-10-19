<?php

namespace Modules\Ocop\Evidence\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Ocop\Dossier\Application\Services\OcopApplicationService;
use Modules\Ocop\Evidence\Application\DTOs\UploadEvidenceDTO;
use Modules\Ocop\Evidence\Domain\Entities\Evidence;
use Modules\Ocop\Evidence\Domain\Entities\EvidenceVersion;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceVersionModel;

class EvidenceUploadService
{
    public function __construct(
        private readonly OcopApplicationService $applicationService,
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function uploadEvidence(UploadEvidenceDTO $dto): EvidenceModel
    {
        $app = $this->applicationService->getApplicationById($dto->applicationId);

        $file = $dto->file;
        $mimeType = $file->getClientMimeType() ?: $file->getMimeType();
        $fileSize = $file->getSize();

        // Validate MIME type & file size invariants via Domain Entity construct check
        $dummyVersion = new EvidenceVersion(
            id: (string) Str::uuid(),
            evidenceId: (string) Str::uuid(),
            versionNumber: 1,
            fileReference: 'temp',
            fileName: $file->getClientOriginalName(),
            checksum: 'temp',
            mimeType: $mimeType,
            fileSize: $fileSize,
            uploadedBy: auth()->check() ? auth()->id() : 'SYSTEM'
        );

        $domainEvidence = new Evidence(
            id: (string) Str::uuid(),
            applicationId: $app->id,
            title: $dto->title,
            evidenceType: $dto->evidenceType,
            sourceType: 'UPLOAD',
            status: 'ACTIVE'
        );

        // Calculate SHA-256 checksum
        $checksum = hash_file('sha256', $file->getRealPath());

        // Store file in private storage disk (under evidences/{application_id}/)
        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $storagePath = "evidences/{$app->id}/" . (string) Str::uuid() . ".{$extension}";
        $disk = config('filesystems.evidence_disk', 'local');
        Storage::disk($disk)->put($storagePath, file_get_contents($file->getRealPath()));

        $evidenceModel = EvidenceModel::create([
            'id' => $domainEvidence->id,
            'application_id' => $domainEvidence->applicationId,
            'title' => $domainEvidence->title,
            'evidence_type' => $domainEvidence->evidenceType,
            'source_type' => $domainEvidence->sourceType,
            'status' => $domainEvidence->status,
        ]);

        $versionModel = EvidenceVersionModel::create([
            'id' => (string) Str::uuid(),
            'evidence_id' => $evidenceModel->id,
            'version_number' => 1,
            'file_reference' => $storagePath,
            'file_name' => $file->getClientOriginalName(),
            'checksum' => $checksum,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
            'uploaded_by' => auth()->check() ? auth()->id() : 'SYSTEM',
            'uploaded_at' => now(),
        ]);

        $evidenceModel->update(['current_version_id' => $versionModel->id]);

        $this->auditService->log(
            action: 'EVIDENCE_UPLOADED',
            entityType: 'Evidence',
            entityId: $evidenceModel->id,
            after: $evidenceModel->toArray(),
            cooperativeId: $app->cooperative_id
        );

        return $evidenceModel->load(['currentVersion', 'versions']);
    }
}
