<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('meeting_id');
            $table->uuid('user_id');
            $table->string('resolution_code', 100);
            $table->string('choice', 30); // FOR, AGAINST, ABSTAIN
            $table->decimal('weight', 18, 4)->default(1.0000);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('meeting_id')->references('id')->on('meetings')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->unique(['meeting_id', 'user_id', 'resolution_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
