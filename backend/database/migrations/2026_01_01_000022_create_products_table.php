<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->string('product_code', 50);
            $table->string('product_name', 255);
            $table->string('category', 100);
            $table->jsonb('specification')->nullable();
            $table->string('brand', 255)->nullable();
            $table->jsonb('quality_information')->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->unique(['cooperative_id', 'product_code']);
            $table->index('cooperative_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
