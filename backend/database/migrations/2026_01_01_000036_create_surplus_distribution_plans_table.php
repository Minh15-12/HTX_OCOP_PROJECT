<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surplus_distribution_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->string('plan_code', 100);
            $table->string('fiscal_period', 30)->nullable();
            $table->integer('financial_year');
            $table->jsonb('source_result_reference')->nullable();
            $table->string('rule_version_reference', 100)->nullable();
            $table->decimal('total_surplus', 18, 2);
            $table->decimal('distributable_surplus', 18, 2);
            $table->decimal('capital_weight', 5, 2)->default(50.00);
            $table->decimal('service_usage_weight', 5, 2)->default(50.00);
            $table->decimal('total_amount', 18, 2)->nullable();
            $table->string('status', 30)->default('DRAFT');
            $table->string('approval_status', 30)->default('DRAFT');
            $table->uuid('created_by')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('restrict');
            $table->unique(['cooperative_id', 'fiscal_period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surplus_distribution_plans');
    }
};
