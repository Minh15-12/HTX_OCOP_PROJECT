<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_issue_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('stock_issue_id');
            $table->uuid('material_id');
            $table->decimal('quantity', 18, 4);
            $table->decimal('unit_price', 18, 2)->default(0.00);
            $table->string('batch_code', 100)->nullable();
            $table->decimal('line_amount', 18, 2)->default(0.00);
            $table->timestamps();

            $table->foreign('stock_issue_id')->references('id')->on('stock_issues')->onDelete('cascade');
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_issue_lines');
    }
};
