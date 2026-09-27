<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('material_batches')) {
            Schema::create('material_batches', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('cooperative_id');
                $table->uuid('material_id');
                $table->uuid('stock_receipt_line_id')->nullable();
                $table->string('batch_number', 100);
                $table->decimal('quantity', 18, 4)->default(0.0000);
                $table->decimal('initial_quantity', 18, 4)->default(0.0000);
                $table->date('manufactured_at')->nullable();
                $table->date('expired_at')->nullable();
                $table->string('status', 30)->default('ACTIVE');
                $table->softDeletes();
                $table->timestamps();

                $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
                $table->foreign('material_id')->references('id')->on('materials')->onDelete('restrict');
                $table->index(['cooperative_id', 'material_id', 'expired_at']);
            });
        }

        if (Schema::hasTable('stock_issues') && !Schema::hasColumn('stock_issues', 'is_credit')) {
            Schema::table('stock_issues', function (Blueprint $table) {
                $table->boolean('is_credit')->default(false);
            });
        }

        if (Schema::hasTable('stock_receipts') && !Schema::hasColumn('stock_receipts', 'kcs_inspection')) {
            Schema::table('stock_receipts', function (Blueprint $table) {
                $table->jsonb('kcs_inspection')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('stock_receipts', 'kcs_inspection')) {
            Schema::table('stock_receipts', function (Blueprint $table) {
                $table->dropColumn('kcs_inspection');
            });
        }

        if (Schema::hasColumn('stock_issues', 'is_credit')) {
            Schema::table('stock_issues', function (Blueprint $table) {
                $table->dropColumn('is_credit');
            });
        }

        Schema::dropIfExists('material_batches');
    }
};
