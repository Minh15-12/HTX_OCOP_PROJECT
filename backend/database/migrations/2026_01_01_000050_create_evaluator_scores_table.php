<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluator_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('assignment_id');
            $table->uuid('indicator_id');
            $table->decimal('score', 10, 2);
            $table->text('comment')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->foreign('assignment_id')->references('id')->on('evaluator_assignments')->onDelete('cascade');
            $table->foreign('indicator_id')->references('id')->on('indicators')->onDelete('restrict');
            $table->unique(['assignment_id', 'indicator_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluator_scores');
    }
};
