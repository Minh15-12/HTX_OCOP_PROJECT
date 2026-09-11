<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mandatory_conditions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('criteria_version_id');
            $table->string('condition_code', 100);
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('condition_type', 50);
            $table->jsonb('configuration');
            $table->boolean('blocking')->default(true);
            $table->timestamps();

            $table->foreign('criteria_version_id')->references('id')->on('criteria_versions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mandatory_conditions');
    }
};
