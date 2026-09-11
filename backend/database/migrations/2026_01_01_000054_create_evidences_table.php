<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('application_id');
            $table->string('title', 255);
            $table->string('evidence_type', 100); // CERTIFICATE, LAB_REPORT, PROCESS_PHOTO, LEGAL_DOCUMENT
            $table->string('source_type', 50)->default('UPLOAD');
            $table->string('status', 30)->default('ACTIVE'); // ACTIVE, SUPERSEDED, VERIFIED, REJECTED
            $table->uuid('current_version_id')->nullable();
            $table->uuid('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('ocop_applications')->onDelete('cascade');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['application_id', 'evidence_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evidences');
    }
};
