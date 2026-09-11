<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->string('warehouse_code', 50);
            $table->string('name', 255);
            $table->string('location', 255)->nullable();
            $table->uuid('manager_id')->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');
            $table->unique(['cooperative_id', 'warehouse_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};
