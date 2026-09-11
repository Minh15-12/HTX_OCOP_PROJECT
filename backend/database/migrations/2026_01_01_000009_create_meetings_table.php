<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->string('meeting_type', 50);
            $table->date('meeting_date');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('status', 30)->default('PLANNED');
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->index(['cooperative_id', 'meeting_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
