<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('final_decisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('application_id');
            $table->jsonb('authority_reference')->nullable();
            $table->string('decision_number', 100);
            $table->date('decision_date');
            $table->string('final_classification', 50); // 3_STAR, 4_STAR, 5_STAR, REJECTED
            $table->date('effective_date')->nullable();
            $table->jsonb('document_reference')->nullable();
            $table->string('status', 30)->default('ISSUED');
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('ocop_applications')->onDelete('restrict');
            $table->index(['application_id', 'decision_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('final_decisions');
    }
};
