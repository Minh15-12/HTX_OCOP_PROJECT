<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crop_seasons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('production_unit_id');
            $table->string('name', 255);
            $table->string('crop', 100);
            $table->date('start_date');
            $table->date('expected_end_date');
            $table->date('actual_end_date')->nullable();
            $table->string('status', 30)->default('PLANNED'); // PLANNED, ACTIVE, HARVESTING, COMPLETED, CANCELLED
            $table->jsonb('plan_information')->nullable();
            $table->timestamps();

            $table->foreign('production_unit_id')->references('id')->on('production_units')->onDelete('restrict');
            $table->index(['production_unit_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crop_seasons');
    }
};
