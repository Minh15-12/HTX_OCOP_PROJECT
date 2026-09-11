<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farming_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('crop_season_id');
            $table->uuid('plot_id');
            $table->string('activity_type', 50); // SPRAYING, FERTILIZING, PLOWING, WEEDING, HARVESTING
            $table->date('activity_date');
            $table->text('description')->nullable();
            $table->uuid('performed_by')->nullable();
            $table->jsonb('attachment_reference')->nullable();
            $table->timestamps();

            $table->foreign('crop_season_id')->references('id')->on('crop_seasons')->onDelete('restrict');
            $table->foreign('plot_id')->references('id')->on('farm_plots')->onDelete('restrict');
            $table->foreign('performed_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['crop_season_id', 'plot_id', 'activity_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farming_logs');
    }
};
