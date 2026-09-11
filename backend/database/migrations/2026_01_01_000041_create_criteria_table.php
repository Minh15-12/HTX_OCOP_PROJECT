<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('criteria', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('criteria_group_id');
            $table->string('code', 100);
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->decimal('max_score', 10, 2);
            $table->boolean('mandatory')->default(false);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->foreign('criteria_group_id')->references('id')->on('criteria_groups')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('criteria');
    }
};
