<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ocop_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->uuid('product_id');
            $table->uuid('criteria_version_id');
            $table->string('application_number', 100)->unique();
            $table->string('application_type', 50)->default('NEW'); // NEW, RE_EVALUATION, UPGRADE
            $table->string('status', 40)->default('DRAFT'); // DRAFT, SELF_ASSESSING, READY_FOR_SUBMISSION, SUBMITTED, IN_REVIEW, NEED_REVISION, RESUBMITTED, READY_FOR_EVALUATION, EVALUATING, CONSOLIDATED, PENDING_DECISION, APPROVED, REJECTED
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('restrict');
            $table->foreign('criteria_version_id')->references('id')->on('criteria_versions')->onDelete('restrict');
            $table->index(['cooperative_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ocop_applications');
    }
};
