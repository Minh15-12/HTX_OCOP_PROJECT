<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receivable_payables', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->string('debt_code', 100);
            $table->string('counterparty_type', 50)->nullable();
            $table->uuid('counterparty_id')->nullable();
            $table->string('counterparty_name', 255)->nullable();
            $table->uuid('member_id')->nullable();
            $table->jsonb('counterparty')->nullable();
            $table->uuid('source_transaction_id')->nullable();
            $table->string('debt_type', 30); // RECEIVABLE, PAYABLE
            $table->decimal('original_amount', 18, 2);
            $table->decimal('outstanding_amount', 18, 2);
            $table->date('due_date')->nullable();
            $table->text('description')->nullable();
            $table->string('status', 30)->default('OPEN'); // OPEN, PARTIALLY_SETTLED, SETTLED, OVERDUE
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('restrict');
            $table->index(['cooperative_id', 'member_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receivable_payables');
    }
};
