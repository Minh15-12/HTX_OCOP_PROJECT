<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_counts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->string('count_number', 100);
            $table->date('count_date');
            $table->jsonb('scope')->nullable();
            $table->string('status', 30)->default('DRAFT'); // DRAFT, SUBMITTED, APPROVED, CANCELLED
            $table->text('reason')->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('restrict');
            $table->unique(['cooperative_id', 'count_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_counts');
    }
};
