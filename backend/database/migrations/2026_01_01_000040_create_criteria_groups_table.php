<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('criteria_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('criteria_version_id');
            $table->string('code', 100);
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->foreign('criteria_version_id')->references('id')->on('criteria_versions')->onDelete('cascade');
            $table->unique(['criteria_version_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('criteria_groups');
    }
};
