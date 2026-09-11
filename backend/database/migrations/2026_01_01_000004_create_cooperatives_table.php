<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cooperatives', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('cooperative_code', 50)->unique();
            $table->string('legal_name', 255);
            $table->string('display_name', 255)->nullable();
            $table->jsonb('legal_information')->nullable();
            $table->jsonb('contact_information')->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cooperatives');
    }
};
