<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('lot_code', 100)->unique();
            $table->uuid('harvest_id')->nullable();
            $table->jsonb('source_information')->nullable();
            $table->decimal('quantity', 18, 4);
            $table->string('unit', 30);
            $table->string('status', 30)->default('ACTIVE');
            $table->timestamps();

            $table->foreign('harvest_id')->references('id')->on('harvests')->onDelete('set null');
        });

        // Add FK lot_id back to harvests if needed
        Schema::table('harvests', function (Blueprint $table) {
            $table->foreign('lot_id')->references('id')->on('lots')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('harvests', function (Blueprint $table) {
            $table->dropForeign(['lot_id']);
        });
        Schema::dropIfExists('lots');
    }
};
