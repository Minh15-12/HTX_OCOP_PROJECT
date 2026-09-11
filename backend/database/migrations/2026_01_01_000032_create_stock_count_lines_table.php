<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_count_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('stock_count_id');
            $table->uuid('material_id');
            $table->decimal('expected_quantity', 18, 4);
            $table->decimal('actual_quantity', 18, 4);
            $table->decimal('difference', 18, 4);
            $table->text('reason')->nullable();

            $table->foreign('stock_count_id')->references('id')->on('stock_counts')->onDelete('cascade');
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_count_lines');
    }
};
