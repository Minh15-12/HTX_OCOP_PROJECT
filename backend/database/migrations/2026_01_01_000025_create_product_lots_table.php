<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_lots', function (Blueprint $table) {
            $table->uuid('product_id');
            $table->uuid('lot_id');
            $table->decimal('quantity', 18, 4)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['product_id', 'lot_id']);
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('lot_id')->references('id')->on('lots')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_lots');
    }
};
