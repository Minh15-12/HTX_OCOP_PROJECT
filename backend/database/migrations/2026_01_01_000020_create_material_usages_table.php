<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_usages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('farming_log_id');
            $table->uuid('material_id');
            $table->decimal('quantity', 18, 4);
            $table->string('unit', 30);
            $table->string('batch_reference', 100)->nullable();
            $table->timestamps();

            $table->foreign('farming_log_id')->references('id')->on('farming_logs')->onDelete('cascade');
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_usages');
    }
};
