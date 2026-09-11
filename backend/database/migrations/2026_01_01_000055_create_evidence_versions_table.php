<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidence_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('evidence_id');
            $table->integer('version_number');
            $table->string('file_reference', 1000);
            $table->string('file_name', 255);
            $table->string('checksum', 128);
            $table->string('mime_type', 100);
            $table->bigInteger('file_size');
            $table->uuid('uploaded_by');
            $table->timestamp('uploaded_at')->useCurrent();
            $table->text('replacement_reason')->nullable();

            $table->foreign('evidence_id')->references('id')->on('evidences')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('restrict');
            $table->unique(['evidence_id', 'version_number']);
        });

        // Add FK current_version_id back to evidences
        Schema::table('evidences', function (Blueprint $table) {
            $table->foreign('current_version_id')->references('id')->on('evidence_versions')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('evidences', function (Blueprint $table) {
            $table->dropForeign(['current_version_id']);
        });
        Schema::dropIfExists('evidence_versions');
    }
};
