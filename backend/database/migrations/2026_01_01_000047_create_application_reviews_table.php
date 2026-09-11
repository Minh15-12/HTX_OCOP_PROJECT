<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('application_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('application_id');
            $table->uuid('reviewer_id');
            $table->string('review_status', 30); // PASSED, NEED_REVISION, REJECTED
            $table->text('comments')->nullable();
            $table->text('requested_revision')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('ocop_applications')->onDelete('cascade');
            $table->foreign('reviewer_id')->references('id')->on('users')->onDelete('restrict');
            $table->index(['application_id', 'review_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_reviews');
    }
};
