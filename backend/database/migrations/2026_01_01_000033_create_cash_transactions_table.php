<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->string('voucher_number', 100);
            $table->string('transaction_number', 100)->nullable();
            $table->string('transaction_type', 30); // INCOME, EXPENSE
            $table->decimal('amount', 18, 2);
            $table->date('transaction_date');
            $table->string('category', 100);
            $table->text('description')->nullable();
            $table->string('payer_payee', 255)->nullable();
            $table->uuid('member_id')->nullable();
            $table->jsonb('counterparty')->nullable();
            $table->jsonb('reference')->nullable();
            $table->jsonb('evidence_reference')->nullable();
            $table->string('status', 30)->default('DRAFT');
            $table->uuid('created_by')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('restrict');
            $table->unique(['cooperative_id', 'transaction_number']);
            $table->index(['cooperative_id', 'transaction_date', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
    }
};
