<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_scopes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('scope_type', 50); // e.g. COOPERATIVE, APPLICATION, EVALUATION_SESSION
            $table->string('scope_value', 255); // e.g. coop_id, session_id, province_code
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'scope_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_scopes');
    }
};
