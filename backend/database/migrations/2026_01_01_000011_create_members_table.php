<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->string('member_code', 50);
            $table->uuid('user_id')->nullable();
            $table->jsonb('identity_information');
            $table->string('member_type', 30)->default('OFFICIAL'); // OFFICIAL, ASSOCIATED
            $table->string('status', 30)->default('ACTIVE'); // DRAFT, ACTIVE, PENDING_TERMINATION, TERMINATED
            $table->date('admission_date')->nullable();
            $table->date('termination_date')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->unique(['cooperative_id', 'member_code']);
            $table->index('cooperative_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
