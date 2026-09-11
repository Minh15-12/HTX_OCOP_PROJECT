<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('self_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('application_id');
            $table->uuid('indicator_id');
            $table->decimal('score', 10, 2);
            $table->text('explanation')->nullable();
            $table->string('status', 30)->default('COMPLETED');
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('ocop_applications')->onDelete('cascade');
            $table->foreign('indicator_id')->references('id')->on('indicators')->onDelete('restrict');
            $table->unique(['application_id', 'indicator_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('self_assessments');
    }
};
