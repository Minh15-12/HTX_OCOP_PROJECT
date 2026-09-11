<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluator_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('evaluation_session_id');
            $table->uuid('evaluator_id');
            $table->string('role', 50)->default('MEMBER'); // CHAIRMAN, SECRETARY, MEMBER
            $table->string('status', 30)->default('ASSIGNED'); // ASSIGNED, SCORING, SUBMITTED, LOCKED
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();

            $table->foreign('evaluation_session_id')->references('id')->on('evaluation_sessions')->onDelete('cascade');
            $table->foreign('evaluator_id')->references('id')->on('users')->onDelete('restrict');
            $table->index('evaluator_id');
            $table->index('evaluation_session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluator_assignments');
    }
};
