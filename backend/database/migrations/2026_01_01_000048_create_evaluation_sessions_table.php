<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('application_id');
            $table->uuid('council_level_id');
            $table->string('status', 30)->default('ASSIGNED'); // ASSIGNED, IN_PROGRESS, COMPLETED, CONSOLIDATED, CANCELLED
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('ocop_applications')->onDelete('restrict');
            $table->foreign('council_level_id')->references('id')->on('council_levels')->onDelete('restrict');
            $table->index(['application_id', 'council_level_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_sessions');
    }
};
