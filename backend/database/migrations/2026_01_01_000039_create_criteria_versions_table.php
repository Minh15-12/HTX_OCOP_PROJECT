<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('criteria_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('version_code', 100)->unique();
            $table->string('name', 255);
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->jsonb('source_reference')->nullable();
            $table->string('status', 30)->default('DRAFT'); // DRAFT, PUBLISHED, RETIRED
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('criteria_versions');
    }
};
