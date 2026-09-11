<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('generated_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('document_type', 100);
            $table->string('source_entity_type', 100)->nullable();
            $table->uuid('source_entity_id')->nullable();
            $table->string('template_version', 100)->nullable();
            $table->string('source_data_version', 100)->nullable();
            $table->string('file_reference', 1000);
            $table->string('checksum', 128)->nullable();
            $table->timestamp('generated_at')->useCurrent();

            $table->index(['source_entity_type', 'source_entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generated_documents');
    }
};
