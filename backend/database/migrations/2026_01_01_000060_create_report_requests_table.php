<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('report_type', 100);
            $table->jsonb('filters')->nullable();
            $table->uuid('requested_by');
            $table->string('status', 30)->default('PENDING'); // PENDING, PROCESSING, COMPLETED, FAILED
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();

            $table->foreign('requested_by')->references('id')->on('users')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_requests');
    }
};
