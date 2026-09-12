<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('land_contributions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('contribution_id');
            $table->string('land_certificate_no', 50);
            $table->string('plot_number', 20);
            $table->string('map_sheet_number', 20);
            $table->decimal('land_area_sqm', 10, 2);
            $table->string('land_use_type', 50);
            $table->decimal('appraised_unit_price', 18, 2);
            $table->decimal('total_land_value', 18, 2);
            $table->string('cadastral_status', 30)->default('PENDING'); // PENDING, NOTARIZED, REGISTERED_CHANGE
            $table->timestamps();

            $table->foreign('contribution_id')->references('id')->on('capital_contributions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('land_contributions');
    }
};
