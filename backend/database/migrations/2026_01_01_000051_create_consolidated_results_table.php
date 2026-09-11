<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consolidated_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('application_id');
            $table->uuid('evaluation_session_id')->unique();
            $table->decimal('total_score', 10, 2);
            $table->string('rule_version_reference', 100)->nullable();
            $table->string('consolidation_status', 30)->default('CALCULATED');
            $table->timestamp('calculated_at')->useCurrent();
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('ocop_applications')->onDelete('restrict');
            $table->foreign('evaluation_session_id')->references('id')->on('evaluation_sessions')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consolidated_results');
    }
};
