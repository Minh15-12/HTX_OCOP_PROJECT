<?php

namespace Modules\Ocop\Dossier\Domain\Entities;

use App\Shared\Domain\Exceptions\DomainException;

class ApplicationReview
{
    public function __construct(
        public readonly string $id,
        public readonly string $applicationId,
        public readonly string $reviewerId,
        public readonly string $reviewStatus, // PASSED, NEED_REVISION, REJECTED
        public readonly ?string $comments = null,
        public readonly ?string $requestedRevision = null,
        public readonly ?string $reviewedAt = null
    ) {
        $allowed = ['PASSED', 'NEED_REVISION', 'REJECTED'];
        if (!in_array($this->reviewStatus, $allowed, true)) {
            throw new DomainException('Trạng thái đánh giá rà soát không hợp lệ', 'INVALID_REVIEW_STATUS', null, 400);
        }
    }
}
