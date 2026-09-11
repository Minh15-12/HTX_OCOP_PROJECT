<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debt_settlements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id')->nullable();
            $table->uuid('debt_id');
            $table->string('settlement_type', 30)->nullable(); // CASH, HARVEST_OFFSET, REVERSAL
            $table->string('payment_method', 30)->default('CASH');
            $table->decimal('amount', 18, 2);
            $table->date('settlement_date');
            $table->uuid('cash_transaction_id')->nullable();
            $table->string('reference_number', 100)->nullable();
            $table->text('note')->nullable();
            $table->jsonb('reference')->nullable();
            $table->string('status', 30)->default('POSTED');
            $table->uuid('created_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('debt_id')->references('id')->on('receivable_payables')->onDelete('restrict');
            $table->index(['debt_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debt_settlements');
    }
};
