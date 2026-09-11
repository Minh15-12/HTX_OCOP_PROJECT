<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposed_classifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('application_id');
            $table->uuid('result_id');
            $table->string('proposed_level', 50); // UNRATED, 1_STAR, 2_STAR, 3_STAR, 4_STAR, 5_STAR
            $table->string('rule_version_reference', 100)->nullable();
            $table->text('reason')->nullable();
            $table->string('status', 30)->default('PROPOSED');
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('ocop_applications')->onDelete('restrict');
            $table->foreign('result_id')->references('id')->on('consolidated_results')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposed_classifications');
    }
};
