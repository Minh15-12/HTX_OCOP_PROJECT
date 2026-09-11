<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_plot_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('member_id');
            $table->uuid('plot_id');
            $table->string('assignment_type', 50)->default('OWNER');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('restrict');
            $table->foreign('plot_id')->references('id')->on('farm_plots')->onDelete('restrict');
            $table->index(['member_id', 'plot_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_plot_assignments');
    }
};
