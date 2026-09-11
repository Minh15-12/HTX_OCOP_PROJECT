<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phi_calculations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('farming_log_id');
            $table->uuid('material_id');
            $table->date('application_date');
            $table->integer('configured_phi_days')->nullable();
            $table->date('safety_date')->nullable();
            $table->string('status', 30)->default('PENDING'); // SAFE, ISOLATED, UNKNOWN
            $table->jsonb('source_reference')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('farming_log_id')->references('id')->on('farming_logs')->onDelete('cascade');
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phi_calculations');
    }
};
