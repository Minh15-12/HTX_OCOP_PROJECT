<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->string('sku', 80);
            $table->string('name', 255);
            $table->string('category', 100); // FERTILIZER, PESTICIDE, SEED, EQUIPMENT
            $table->string('unit', 30); // KG, LITER, BAG, BOTTLE
            $table->jsonb('safety_information')->nullable();
            $table->decimal('reorder_threshold', 18, 4)->default(0.0000);
            $table->string('status', 30)->default('ACTIVE');
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->unique(['cooperative_id', 'sku']);
            $table->index('cooperative_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
