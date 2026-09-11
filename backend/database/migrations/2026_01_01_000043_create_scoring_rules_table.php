<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scoring_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('criteria_version_id');
            $table->string('rule_code', 100);
            $table->string('rule_type', 50);
            $table->jsonb('configuration');
            $table->integer('priority')->default(0);
            $table->string('status', 30)->default('ACTIVE');
            $table->timestamps();

            $table->foreign('criteria_version_id')->references('id')->on('criteria_versions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scoring_rules');
    }
};
