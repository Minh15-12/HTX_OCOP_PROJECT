<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farm_plots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('production_unit_id');
            $table->string('plot_code', 50);
            $table->jsonb('land_relation')->nullable();
            $table->decimal('area', 18, 4);
            $table->string('status', 30)->default('ACTIVE');
            $table->timestamps();

            $table->foreign('production_unit_id')->references('id')->on('production_units')->onDelete('restrict');
            $table->unique(['production_unit_id', 'plot_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farm_plots');
    }
};
