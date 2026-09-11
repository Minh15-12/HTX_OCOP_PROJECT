<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('harvests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('crop_season_id');
            $table->uuid('plot_id');
            $table->date('harvest_date');
            $table->decimal('quantity', 18, 4);
            $table->string('unit', 30);
            $table->jsonb('quality_information')->nullable();
            $table->uuid('lot_id')->nullable();
            $table->timestamps();

            $table->foreign('crop_season_id')->references('id')->on('crop_seasons')->onDelete('restrict');
            $table->foreign('plot_id')->references('id')->on('farm_plots')->onDelete('restrict');
            $table->index(['crop_season_id', 'harvest_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('harvests');
    }
};
