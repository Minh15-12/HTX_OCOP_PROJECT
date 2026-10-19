<?php

namespace Modules\Ocop\Evidence\Application\Services;

use App\Shared\Domain\Exceptions\DomainException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Audit\Application\Services\AuditService;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Ocop\Dossier\Domain\Entities\OcopApplication;
use Modules\Ocop\Evidence\Application\DTOs\ReplaceEvidenceVersionDTO;
use Modules\Ocop\Evidence\Domain\Entities\EvidenceVersion;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceModel;
use Modules\Ocop\Evidence\Infrastructure\Persistence\Models\EvidenceVersionModel;

class EvidenceVersionService
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly AuditService $auditService
    ) {}

    public function getEvidenceById(string $id): EvidenceModel
    {
        $evidence = EvidenceModel::with(['application', 'currentVersion', 'versions.uploader', 'indicators'])->find($id);

        if (!$evidence) {
            throw new DomainException('Minh chứng không tồn tại trong hệ thống', 'EVIDENCE_NOT_FOUND', null, 404);
        }

        if ($this->tenantContext->hasTenant() && $evidence->application?->cooperative_id !== $this->tenantContext->getCooperativeId()) {
            throw new DomainException('Bạn không có quyền truy cập minh chứng của Hợp tác xã khác', 'UNAUTHORIZED_TENANT_ACCESS', null, 403);
        }

        return $evidence;
    }

    public function replaceVersion(ReplaceEvidenceVersionDTO $dto): EvidenceModel
    {
        $evidence = $this->getEvidenceById($dto->evidenceId);
        $app = $evidence->application;

        // Assert dossier is editable
        $domainApp = new OcopApplication(
            id: $app->id,
            cooperativeId: $app->cooperative_id,
            productId: $app->product_id,
            criteriaVersionId: $app->criteria_version_id,
            applicationNumber: $app->application_number,
            applicationType: $app->application_type,
            status: $app->status
        );
        $domainApp->assertEditable();

        if (trim($dto->replacementReason) === '') {
            throw new DomainException('Lý do thay thế phiên bản minh chứng không được để trống', 'REPLACEMENT_REASON_REQUIRED', null, 400);
        }

        $file = $dto->file;
        $mimeType = $file->getClientMimeType() ?: $file->getMimeType();
        $fileSize = $file->getSize();

        $nextVersionNumber = (int) $evidence->versions()->max('version_number') + 1;

        // Validate MIME type & file size invariants via Domain Entity construct check
        $dummyVersion = new EvidenceVersion(
            id: (string) Str::uuid(),
            evidenceId: $evidence->id,
            versionNumber: $nextVersionNumber,
            fileReference: 'temp',
            fileName: $file->getClientOriginalName(),
            checksum: 'temp',
            mimeType: $mimeType,
            fileSize: $fileSize,
            uploadedBy: auth()->check() ? auth()->id() : 'SYSTEM',
            replacementReason: $dto->replacementReason
        );

        // Calculate SHA-256 checksum
        $checksum = hash_file('sha256', $file->getRealPath());

        // Store file in private storage disk (under evidences/{application_id}/)
        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $storagePath = "evidences/{$app->id}/" . (string) Str::uuid() . ".{$extension}";
        $disk = config('filesystems.evidence_disk', 'local');
        Storage::disk($disk)->put($storagePath, file_get_contents($file->getRealPath()));

        $newVersion = EvidenceVersionModel::create([
            'id' => (string) Str::uuid(),
            'evidence_id' => $evidence->id,
            'version_number' => $nextVersionNumber,
            'file_reference' => $storagePath,
            'file_name' => $file->getClientOriginalName(),
            'checksum' => $checksum,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
            'uploaded_by' => auth()->check() ? auth()->id() : 'SYSTEM',
            'uploaded_at' => now(),
            'replacement_reason' => $dto->replacementReason,
        ]);

        $before = $evidence->toArray();
        $evidence->update([
            'current_version_id' => $newVersion->id,
            'status' => 'ACTIVE', // Reset status back to ACTIVE if was REJECTED
        ]);

        $this->auditService->log(
            action: 'EVIDENCE_REPLACED',
            entityType: 'Evidence',
            entityId: $evidence->id,
            before: $before,
            after: $evidence->toArray(),
            cooperativeId: $app->cooperative_id
        );

        return $evidence->fresh(['currentVersion', 'versions.uploader', 'indicators']);
    }
}
